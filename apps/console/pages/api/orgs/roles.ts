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

import {
  createResourceUid,
  ORG_PERMISSION_KEYS,
  type OrgPermission,
} from '@aglyn/aglyn'
import {
  firebaseAdmin,
  logOrgActivity,
  memberHasOrgPermission,
  resolveOrgMembership,
} from '@aglyn/tenant-data-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

function sanitizePermissions(
  raw: unknown,
): Partial<Record<OrgPermission, boolean>> {
  if (!raw || typeof raw !== 'object') return {}
  const permissions: Partial<Record<OrgPermission, boolean>> = {}
  for (const key of ORG_PERMISSION_KEYS) {
    const value = (raw as Record<string, unknown>)[key]
    if (typeof value === 'boolean') permissions[key] = value
  }
  return permissions
}

/**
 * Custom org roles (AGL-243) at `orgs/{orgId}/roles`. GET lists (any
 * member); POST saves/deletes (members.manage permission, or staff).
 * Deleting a role clears it from members that carry it so nobody keeps a
 * dangling roleId.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const authorization = req.headers.authorization ?? ''
  const idToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined
  if (!idToken) return res.status(401).json({ error: 'Unauthenticated' })

  const orgId = String(
    (req.method === 'GET' ? req.query.orgId : req.body?.orgId) ?? '',
  )
  if (!orgId) return res.status(400).json({ error: 'Missing orgId' })

  try {
    const decoded = await firebaseAdmin.app().auth().verifyIdToken(idToken)
    const isStaff = decoded['staff'] === true
    const actor = await resolveOrgMembership(decoded.uid, orgId)
    if (!actor && !isStaff) {
      return res
        .status(403)
        .json({ error: 'You are not a member of that organization' })
    }
    const firestore = firebaseAdmin.app().firestore()
    const rolesRef = firestore.collection('orgs').doc(orgId).collection('roles')

    if (req.method === 'GET') {
      const snapshot = await rolesRef.limit(50).get()
      return res.status(200).json({
        roles: snapshot.docs.map((doc) => ({ $id: doc.id, ...doc.data() })),
      })
    }

    if (
      !isStaff &&
      !(await memberHasOrgPermission(orgId, actor?.member, 'members.manage'))
    ) {
      return res
        .status(403)
        .json({ error: 'Managing roles requires the members.manage permission' })
    }

    const action = String(req.body?.action ?? '')
    if (action === 'save') {
      const name = String(req.body?.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Name the role' })
      const roleId = String(req.body?.roleId ?? '') || createResourceUid()
      await rolesRef.doc(roleId).set(
        {
          name,
          description: String(req.body?.description ?? '').trim(),
          permissions: sanitizePermissions(req.body?.permissions),
        },
        { merge: true },
      )
      await logOrgActivity(
        orgId,
        { uid: decoded.uid, email: decoded.email },
        req.body?.roleId ? 'Updated role' : 'Created role',
        { type: 'member', id: roleId, name },
      )
      return res.status(200).json({ ok: true, roleId })
    }

    if (action === 'delete') {
      const roleId = String(req.body?.roleId ?? '')
      if (!roleId) return res.status(400).json({ error: 'Missing roleId' })
      const roleSnapshot = await rolesRef.doc(roleId).get()
      await rolesRef.doc(roleId).delete()
      // Clear dangling references so members fall back to role defaults.
      const carriers = await firestore
        .collection('orgs')
        .doc(orgId)
        .collection('members')
        .where('roleId', '==', roleId)
        .get()
      const batch = firestore.batch()
      for (const member of carriers.docs) {
        batch.set(member.ref, { roleId: null }, { merge: true })
      }
      await batch.commit()
      await logOrgActivity(
        orgId,
        { uid: decoded.uid, email: decoded.email },
        'Deleted role',
        {
          type: 'member',
          id: roleId,
          name: String(roleSnapshot.get('name') ?? roleId),
        },
      )
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Role management failed' })
  }
}
