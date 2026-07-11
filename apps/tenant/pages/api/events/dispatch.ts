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

import { isSiteEventType } from '@aglyn/aglyn'
import type { NextApiRequest, NextApiResponse } from 'next'
import { runSingleAction } from '@aglyn/tenant-runtime'

/**
 * Site-event dispatch (AGL-256): the page runtime evaluates client-side
 * trigger conditions (scroll thresholds, selectors, dwell time) and posts
 * the fired action here so its SERVER steps run. Only site-event actions
 * dispatch this way — server events keep their own emitters. Payload
 * fields are bounded strings; the run cap and `actions` entitlement gate
 * inside the runner.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const hostId = String(req.body?.hostId ?? '')
  const actionId = String(req.body?.actionId ?? '')
  const event = String(req.body?.event ?? '')
  if (!hostId || !actionId || !isSiteEventType(event)) {
    return res.status(400).json({ error: 'Bad dispatch' })
  }
  const raw = req.body?.payload
  const payload: Record<string, string> = {}
  if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw).slice(0, 20)) {
      if (/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key)) {
        payload[key] = String(value).slice(0, 500)
      }
    }
  }
  const alerts = await runSingleAction(hostId, actionId, event, payload)
  return res.status(200).json({ ok: true, alerts })
}
