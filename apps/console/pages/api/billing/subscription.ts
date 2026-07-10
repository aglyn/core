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
  firebaseAdmin,
  memberHasOrgPermission,
  resolveOrgMembership,
} from '@aglyn/tenant-data-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

const PRICE_ENV: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
}

async function stripeRequest(
  secretKey: string,
  method: 'GET' | 'POST',
  path: string,
  body?: URLSearchParams,
): Promise<any> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {}),
    },
    ...(body ? { body: body.toString() } : {}),
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Stripe ${path} failed`)
  }
  return payload
}

/** The org's active (or trialing/past_due) subscription, if any. */
async function activeSubscription(
  secretKey: string,
  customerId: string,
): Promise<any | null> {
  const subscriptions = await stripeRequest(
    secretKey,
    'GET',
    `subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=5`,
  )
  return (
    (subscriptions?.data ?? []).find((subscription: any) =>
      ['active', 'trialing', 'past_due'].includes(subscription.status),
    ) ?? null
  )
}

/**
 * Subscription management (AGL-269), billing.manage-gated:
 * - `cancel`   → cancel_at_period_end (plan runs out at renewal)
 * - `resume`   → clears a pending cancelation
 * - `preview`  → prorated amount for switching to another plan today,
 *   via Stripe's upcoming-invoice preview
 * - `switch`   → updates the subscription item to the target plan's
 *   price with prorations (an existing subscription never goes through
 *   Checkout again). 501 without Stripe env.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return res.status(501).json({ error: 'Billing is not configured' })
  }
  const authorization = req.headers.authorization ?? ''
  const idToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined
  if (!idToken) return res.status(401).json({ error: 'Unauthenticated' })
  const orgId = String(req.body?.orgId ?? '')
  const action = String(req.body?.action ?? '')
  if (!orgId || !['cancel', 'resume', 'preview', 'switch'].includes(action)) {
    return res.status(400).json({ error: 'Bad request' })
  }

  try {
    const decoded = await firebaseAdmin.app().auth().verifyIdToken(idToken)
    const isStaff = decoded['staff'] === true
    const actor = await resolveOrgMembership(decoded.uid, orgId)
    if (
      !isStaff &&
      !(await memberHasOrgPermission(orgId, actor?.member, 'billing.manage'))
    ) {
      return res.status(403).json({ error: 'billing.manage required' })
    }
    const org = await firebaseAdmin
      .app()
      .firestore()
      .collection('orgs')
      .doc(orgId)
      .get()
    const customerId = org.get('stripeCustomerId')
    if (!customerId) {
      return res.status(409).json({ error: 'No billing account yet' })
    }
    const subscription = await activeSubscription(secretKey, String(customerId))
    if (!subscription) {
      return res.status(409).json({ error: 'No active subscription' })
    }

    if (action === 'cancel' || action === 'resume') {
      const updated = await stripeRequest(
        secretKey,
        'POST',
        `subscriptions/${subscription.id}`,
        new URLSearchParams({
          cancel_at_period_end: action === 'cancel' ? 'true' : 'false',
        }),
      )
      // Mirror onto the org doc so the plan card reflects it immediately
      // (the webhook confirms on the next event).
      await org.ref.set(
        {
          subscription: {
            status: updated.status ?? subscription.status,
            cancelAtPeriodEnd: updated.cancel_at_period_end === true,
          },
        },
        { merge: true },
      )
      return res.status(200).json({
        ok: true,
        cancelAtPeriodEnd: updated.cancel_at_period_end === true,
        currentPeriodEnd: updated.current_period_end
          ? new Date(updated.current_period_end * 1000).toISOString()
          : null,
      })
    }

    // Preview/switch share the target resolution.
    const targetPlan = String(req.body?.plan ?? '')
    const targetPrice = PRICE_ENV[targetPlan]
    if (!targetPrice) {
      return res.status(400).json({ error: 'Unknown target plan' })
    }
    const itemId = subscription.items?.data?.[0]?.id

    if (action === 'switch') {
      const updated = await stripeRequest(
        secretKey,
        'POST',
        `subscriptions/${subscription.id}`,
        new URLSearchParams({
          'items[0][id]': String(itemId),
          'items[0][price]': targetPrice,
          proration_behavior: 'create_prorations',
          'metadata[plan]': targetPlan,
          ...(subscription.metadata?.tenantId
            ? { 'metadata[tenantId]': subscription.metadata.tenantId }
            : {}),
          'metadata[orgId]': orgId,
        }),
      )
      // Mirror immediately; the webhook confirms on the next event.
      await org.ref.set(
        {
          plan: targetPlan,
          subscription: {
            status: updated.status ?? subscription.status,
            priceId: targetPrice,
          },
        },
        { merge: true },
      )
      return res.status(200).json({ ok: true, plan: targetPlan })
    }

    const preview = await stripeRequest(
      secretKey,
      'GET',
      `invoices/upcoming?customer=${encodeURIComponent(String(customerId))}` +
        `&subscription=${encodeURIComponent(subscription.id)}` +
        `&subscription_items[0][id]=${encodeURIComponent(String(itemId))}` +
        `&subscription_items[0][price]=${encodeURIComponent(targetPrice)}` +
        `&subscription_proration_behavior=create_prorations`,
    )
    return res.status(200).json({
      amountDueCents: preview?.amount_due ?? 0,
      currency: preview?.currency ?? 'usd',
      periodEnd: preview?.period_end
        ? new Date(preview.period_end * 1000).toISOString()
        : null,
    })
  } catch (error) {
    console.error(error)
    return res.status(502).json({ error: 'Subscription operation failed' })
  }
}
