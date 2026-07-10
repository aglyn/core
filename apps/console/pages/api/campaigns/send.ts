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
  checkQuota,
  contactMatchesSegment,
  createResourceUid,
  assignExperimentVariant,
  type HostExperiment,
} from '@aglyn/aglyn'
import {
  orgDataCollectionForHost, firebaseAdmin, getOrgForHost } from '@aglyn/tenant-data-admin'
import { createHash, createHmac } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_RECIPIENTS_PER_SEND = 500
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Stable doc id for a suppression entry (emails are PII — hash them). */
export function suppressionId(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex')
}

/** HMAC for unsubscribe links; env-gated on the shared secret. */
export function unsubscribeSignature(
  hostId: string,
  email: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${hostId}:${email.toLowerCase()}`)
    .digest('hex')
}

/**
 * Campaign send (AGL-161): resolves the audience server-side (leads, site
 * members, or a manual list), drops suppressed addresses, enforces the
 * plan's monthly send cap, and delivers one email per recipient through
 * Resend with a signed unsubscribe link. Env-gated: without
 * RESEND_API_KEY + USAGE_EMAIL_FROM the route answers 501. Squarespace
 * charges $5–48/mo for this; Aglyn includes it per tier.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const resendKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.USAGE_EMAIL_FROM
  const unsubscribeSecret =
    process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET
  if (!resendKey || !emailFrom || !unsubscribeSecret) {
    return res.status(501).json({
      error:
        'Campaigns are not configured (RESEND_API_KEY, USAGE_EMAIL_FROM, ' +
        'EMAIL_UNSUBSCRIBE_SECRET).',
    })
  }

  const hostId = String(req.body?.hostId ?? '')
  const subject = String(req.body?.subject ?? '')
    .trim()
    .slice(0, 150)
  const body = String(req.body?.body ?? '')
    .trim()
    .slice(0, 20000)
  const audience = String(req.body?.audience ?? 'leads')
  if (!hostId || !subject || !body) {
    return res.status(400).json({ error: 'Missing hostId, subject, or body' })
  }
  if (!['leads', 'members', 'manual', 'segment', 'list'].includes(audience)) {
    return res.status(400).json({ error: 'Unknown audience' })
  }

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
      return res.status(404).json({ error: 'Unknown site' })
    }
    const memberRole = (hostSnapshot.get('memberRoles') ?? {})[decoded.uid]
    if (memberRole !== 'admin' && memberRole !== 'editor') {
      return res.status(403).json({ error: 'Not a site admin' })
    }

    // Audience resolution.
    let recipients: string[] = []
    if (audience === 'leads') {
      const leads = await hostRef.collection('leads').limit(1000).get()
      recipients = leads.docs.map((doc) => String(doc.get('email') ?? ''))
    } else if (audience === 'members') {
      const members = await hostRef.collection('siteMembers').limit(1000).get()
      recipients = members.docs.map((doc) => String(doc.get('email') ?? ''))
    } else if (audience === 'segment') {
      // Contact segments (AGL-199): resolve the saved filter against the
      // contacts collection server-side.
      const segmentId = String(req.body?.segmentId ?? '')
      const segmentSnapshot = segmentId
        ? await (await orgDataCollectionForHost(hostId, 'contactSegments')).doc(segmentId).get()
        : null
      if (!segmentSnapshot?.exists) {
        return res.status(400).json({ error: 'Unknown segment' })
      }
      const segment = {
        tags: segmentSnapshot.get('tags') ?? [],
        sources: segmentSnapshot.get('sources') ?? [],
      }
      const contacts = await (await orgDataCollectionForHost(hostId, 'contacts')).limit(5000).get()
      recipients = contacts.docs
        .filter((doc) =>
          contactMatchesSegment(
            { tags: doc.get('tags') ?? [], sources: doc.get('sources') ?? {} },
            segment,
          ),
        )
        .map((doc) => String(doc.get('email') ?? ''))
    } else if (audience === 'list') {
      // Org lists (AGL-254): static audiences enrolled manually or by the
      // enrollList automation step.
      const listId = String(req.body?.listId ?? '')
      const listRef = listId
        ? (await orgDataCollectionForHost(hostId, 'contacts')).parent
            ?.collection('lists')
            .doc(listId)
        : null
      if (!listRef) return res.status(400).json({ error: 'Unknown list' })
      const members = await listRef.collection('members').limit(5000).get()
      recipients = members.docs.map((doc) => String(doc.get('email') ?? ''))
    } else {
      recipients = Array.isArray(req.body?.emails)
        ? req.body.emails.map((value: unknown) => String(value))
        : []
    }
    recipients = [
      ...new Set(
        recipients
          .map((email) => email.trim().toLowerCase())
          .filter((email) => EMAIL_PATTERN.test(email)),
      ),
    ].slice(0, MAX_RECIPIENTS_PER_SEND)
    if (!recipients.length) {
      return res.status(400).json({ error: 'The audience is empty' })
    }

    // Suppression list (unsubscribes).
    const suppressed = new Set<string>()
    const suppressions = await hostRef
      .collection('suppressions')
      .limit(5000)
      .get()
    for (const doc of suppressions.docs) suppressed.add(doc.id)
    const sendable = recipients.filter(
      (email) => !suppressed.has(suppressionId(email)),
    )
    if (!sendable.length) {
      return res
        .status(400)
        .json({ error: 'Every recipient has unsubscribed' })
    }

    // Monthly cap by the owning org's plan (dark-launch rule, AGL-238).
    const monthKey = new Date().toISOString().slice(0, 7)
    const counterRef = hostRef.collection('counters').doc('emailSends')
    {
      // Plan-less orgs resolve as free (AGL-247) — the cap always runs.
      const tenant = (await getOrgForHost(hostId))?.org
      const counterSnapshot = await counterRef.get()
      const used = Number(counterSnapshot.get(monthKey) ?? 0)
      const quota = checkQuota(
        tenant as any,
        'emailSendsPerMonth',
        used + sendable.length - 1,
      )
      if (!quota.allowed) {
        return res.status(403).json({
          error:
            `Monthly email limit reached (${quota.limit}) — upgrade in ` +
            'Billing or shrink the audience',
        })
      }
    }

    const subdomain = hostSnapshot.get('subdomain')
    const siteBase = hostSnapshot.get('cname')
      ? `https://${hostSnapshot.get('cname')}`
      : `https://${subdomain}.aglyn.app`

    const campaignId = String(req.body?.campaignId ?? '') || createResourceUid()

    // Email A/B (AGL-255): each recipient deterministically lands in a
    // variant whose subject/body overrides apply; sends count as that
    // variant's exposures. A finished experiment sends the winner copy.
    const experimentId = String(req.body?.experimentId ?? '')
    let experiment: (HostExperiment & { $id: string }) | null = null
    if (experimentId) {
      const experimentSnapshot = await hostRef
        .collection('experiments')
        .doc(experimentId)
        .get()
      const data = experimentSnapshot.data() as HostExperiment | undefined
      if (
        !experimentSnapshot.exists ||
        !data ||
        data.target !== 'email' ||
        (data.status !== 'running' && !data.winnerVariantId)
      ) {
        return res
          .status(400)
          .json({ error: 'Pick a running email experiment' })
      }
      experiment = { $id: experimentSnapshot.id, ...data }
    }
    const variantSends: Record<string, number> = {}
    let sent = 0
    for (const email of sendable) {
      const signature = unsubscribeSignature(hostId, email, unsubscribeSecret)
      const unsubscribeUrl =
        `${siteBase}/api/email/unsubscribe?hostId=${encodeURIComponent(hostId)}` +
        `&email=${encodeURIComponent(email)}&sig=${signature}`
      // Variant assignment keys on the recipient address (AGL-255) so a
      // re-send reaches the same variant.
      const variant = experiment
        ? assignExperimentVariant(experiment, experiment.$id, email)
        : null
      const recipientSubject = variant?.subject?.trim() || subject
      const recipientBody = variant?.body?.trim() || body
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [email],
          subject: recipientSubject,
          text: `${recipientBody}\n\n—\nUnsubscribe: ${unsubscribeUrl}`,
          headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
          // Event attribution (AGL-268): the opens/clicks webhook maps
          // deliveries back to the campaign (and experiment) via tags.
          tags: [
            { name: 'hostId', value: hostId },
            { name: 'campaignId', value: campaignId },
            ...(experiment
              ? [{ name: 'experimentId', value: experiment.$id }]
              : []),
          ],
        }),
      }).catch(() => null)
      if (response?.ok) {
        sent += 1
        if (variant) {
          variantSends[variant.id] = (variantSends[variant.id] ?? 0) + 1
        }
      }
    }
    // Sends are the email variant's exposures (AGL-255).
    if (experiment && experiment.status === 'running') {
      for (const [variantId, count] of Object.entries(variantSends)) {
        await hostRef
          .collection('experiments')
          .doc(experiment.$id)
          .collection('stats')
          .doc(variantId)
          .set(
            {
              exposures: firebaseAdmin.firestore.FieldValue.increment(count),
              updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          )
          .catch(() => undefined)
      }
    }

    await hostRef.collection('campaigns').doc(campaignId).set(
      {
        subject,
        body,
        audience,
        ...(experiment ? { experimentId: experiment.$id } : {}),
        stats: {
          recipients: sendable.length,
          sent,
          ...(Object.keys(variantSends).length ? { variantSends } : {}),
        },
        status: 'sent',
        sentAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        sentBy: decoded.uid,
      },
      { merge: true },
    )
    await counterRef.set(
      { [monthKey]: firebaseAdmin.firestore.FieldValue.increment(sent) },
      { merge: true },
    )
    return res.status(200).json({ campaignId, recipients: sendable.length, sent })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Campaign send failed' })
  }
}
