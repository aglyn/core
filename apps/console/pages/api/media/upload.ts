/**
 * @license
 * Copyright 2026 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { checkQuota, createResourceUid } from '@aglyn/aglyn'
import { firebaseAdmin } from '@aglyn/tenant-data-admin'
import { randomUUID } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

// Base64 JSON payloads: ~15MB of image data encodes to ~20MB of body.
export const config = { api: { bodyParser: { sizeLimit: '21mb' } } }

const MAX_FILE_BYTES = 15 * 1024 * 1024

/**
 * Authenticated media upload/delete (AGL-85): Storage rules deny client
 * writes entirely, so every mutation passes this route's checks — Firebase
 * ID token, host-admin membership, image-only content types, and the
 * server-enforced storage quota (client-side checks are advisory). Files
 * land at `hosts/{hostId}/media/{mediaId}` with a download-token URL; the
 * Firestore metadata mirror and bytes counter are written here too.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const hostId = String(req.body?.hostId ?? '')
  if (!hostId) return res.status(400).json({ error: 'Missing hostId' })

  const authorization = req.headers.authorization ?? ''
  const idToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined
  if (!idToken) return res.status(401).json({ error: 'Unauthenticated' })

  try {
    const decoded = await firebaseAdmin.app().auth().verifyIdToken(idToken)
    const firestore = firebaseAdmin.app().firestore()
    const hostRef = firestore.collection('hosts').doc(hostId)
    const hostSnapshot = await hostRef.get()
    if (!hostSnapshot.exists) {
      return res.status(404).json({ error: 'Unknown host' })
    }
    const admins = hostSnapshot.get('admins') ?? {}
    if (!admins[decoded.uid]) {
      return res.status(403).json({ error: 'Not a host admin' })
    }
    const bucket = firebaseAdmin
      .app()
      .storage()
      .bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)

    if (req.method === 'DELETE') {
      const mediaId = String(req.body?.mediaId ?? '')
      if (!mediaId) return res.status(400).json({ error: 'Missing mediaId' })
      const mediaRef = hostRef.collection('media').doc(mediaId)
      const mediaSnapshot = await mediaRef.get()
      // Object may already be gone; still remove the metadata.
      await bucket
        .file(`hosts/${hostId}/media/${mediaId}`)
        .delete()
        .catch(() => undefined)
      if (mediaSnapshot.exists) {
        const sizeBytes = Number(mediaSnapshot.get('sizeBytes') ?? 0)
        await mediaRef.delete()
        await hostRef
          .collection('counters')
          .doc('media')
          .set(
            {
              bytes: firebaseAdmin.firestore.FieldValue.increment(-sizeBytes),
              count: firebaseAdmin.firestore.FieldValue.increment(-1),
            },
            { merge: true },
          )
      }
      return res.status(200).json({ deleted: true })
    }

    const fileName = String(req.body?.fileName ?? 'upload').slice(0, 200)
    const contentType = String(req.body?.contentType ?? '')
    const data = String(req.body?.data ?? '')
    if (!contentType.startsWith('image/')) {
      return res.status(415).json({ error: 'Only image uploads are supported' })
    }
    const buffer = Buffer.from(data, 'base64')
    if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
      return res.status(413).json({ error: 'File is empty or too large' })
    }

    // Server-side quota: counter bytes + this file against the plan limit
    // (no enforcement until the tenant has an explicit plan — AGL-38 gate).
    const counterSnapshot = await hostRef
      .collection('counters')
      .doc('media')
      .get()
    const usedBytes = Number(counterSnapshot.get('bytes') ?? 0)
    const tenantSnapshot = await firestore
      .collection('tenants')
      .doc(decoded.uid)
      .get()
    const tenant = tenantSnapshot.data() ?? {}
    if (tenant['plan']) {
      const usedMb = (usedBytes + buffer.length) / (1024 * 1024)
      const quota = checkQuota(tenant, 'storagePerHostMb', usedMb - 1)
      if (!quota.allowed) {
        return res.status(403).json({
          error: `Storage limit reached (${quota.limit} MB)`,
        })
      }
    }

    const mediaId = createResourceUid()
    const token = randomUUID()
    const file = bucket.file(`hosts/${hostId}/media/${mediaId}`)
    await file.save(buffer, {
      contentType,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    })
    const url =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(`hosts/${hostId}/media/${mediaId}`)}` +
      `?alt=media&token=${token}`

    await hostRef.collection('media').doc(mediaId).set({
      fileName,
      contentType,
      sizeBytes: buffer.length,
      url,
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    })
    await hostRef
      .collection('counters')
      .doc('media')
      .set(
        {
          bytes: firebaseAdmin.firestore.FieldValue.increment(buffer.length),
          count: firebaseAdmin.firestore.FieldValue.increment(1),
        },
        { merge: true },
      )

    return res.status(200).json({ mediaId, url })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
