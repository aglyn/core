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

// Emulator-only e2e seed for the CURRENT org data model (unlike the
// legacy seed-demo-host.mjs, which predates organizations). Creates the
// auth user, the org (business plan, active subscription), the
// users/{uid}/orgs workspace mirror, hostIndex, the host with
// memberRoles, org-scoped data (datasets/contacts/lists), and
// host-scoped fixtures.
//
// THE INVARIANT that makes e2e pages render: every seeded doc carries
// the fields the console's queries orderBy/where on — Firestore
// silently drops docs missing an orderBy field, which is what made the
// old seed look "empty" in the browser (bookings orderBy startsAtMs,
// media orderBy createdAt + root-folder filter).
//
//   FIRESTORE_EMULATOR_HOST=localhost:8082 \
//   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
//     node tools/scripts/seed-e2e.mjs [--host demo] [--project aglyn-main]
//
// Idempotent: deterministic `seed-…` ids, merge-set writes. Refuses to
// run without both emulator hosts so it can never touch production.

import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

if (
  !process.env.FIRESTORE_EMULATOR_HOST ||
  !process.env.FIREBASE_AUTH_EMULATOR_HOST
) {
  console.error(
    'Refusing to run: FIRESTORE_EMULATOR_HOST and ' +
      'FIREBASE_AUTH_EMULATOR_HOST must both point at local emulators. ' +
      'This seed is emulator-only by design.',
  )
  process.exit(1)
}

const args = process.argv.slice(2)
const argValue = (flag, fallback) => {
  const index = args.indexOf(flag)
  return index !== -1 ? args[index + 1] : fallback
}
const hostId = argValue('--host', 'demo')
const projectId = argValue(
  '--project',
  process.env.FIREBASE_PROJECT_ID ?? 'aglyn-main',
)

if (!getApps().length) initializeApp({ projectId })
const firestore = getFirestore()
const auth = getAuth()

// ── Auth user (owner, staff) ────────────────────────────────────────────────
export const E2E_UID = 'e2e-owner'
export const E2E_EMAIL = 'e2e@aglyn.test'
// Must satisfy the sign-in form's client-side policy (uppercase +
// lowercase + digit) — the harness signs in through the real UI.
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'E2e-Password-1'
const orgId = E2E_UID // Org doc id = owner uid, matching real signups.

try {
  await auth.getUser(E2E_UID)
  // Converge on re-runs: the password may have changed between seeds.
  await auth.updateUser(E2E_UID, {
    password: E2E_PASSWORD,
    emailVerified: true,
  })
} catch {
  await auth.createUser({
    uid: E2E_UID,
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    emailVerified: true,
    displayName: 'E2E Owner',
  })
}
await auth.setCustomUserClaims(E2E_UID, { staff: true })

const now = FieldValue.serverTimestamp()
let written = 0
const put = async (ref, data) => {
  await ref.set({ ...data, updatedAt: now }, { merge: true })
  written += 1
}

// ── Org, membership mirror, host, hostIndex ────────────────────────────────
await put(firestore.collection('orgs').doc(orgId), {
  name: 'E2E Bakery Co',
  ownerUid: E2E_UID,
  plan: 'business',
  // Plugin switchboard (AGL-416): explicit so the e2e exercises the
  // org-gated loader; keep in sync with FIRST_PARTY_PLUGINS defaults.
  enabledPlugins: [
    'mui',
    'bookings',
    'commerce',
    'community',
    'contacts',
    'data',
    'email',
    'events-calendar',
    'inbox',
    'logic',
    'marketing',
    'redirects',
    'workflows',
  ],
  subscription: { status: 'active' },
  createdAt: now,
})
await put(
  firestore.collection('orgs').doc(orgId).collection('members').doc(E2E_UID),
  {
    email: E2E_EMAIL,
    displayName: 'E2E Owner',
    role: 'owner',
    status: 'active',
    createdAt: now,
  },
)
await put(
  firestore.collection('users').doc(E2E_UID).collection('orgs').doc(orgId),
  { name: 'E2E Bakery Co', role: 'owner', createdAt: now },
)
await put(firestore.collection('hostIndex').doc(hostId), { orgId })
await put(firestore.collection('hosts').doc(hostId), {
  subdomain: hostId,
  displayName: 'Demo Bakery',
  orgId,
  tenantId: E2E_UID,
  admins: { [E2E_UID]: true },
  memberRoles: { [E2E_UID]: 'admin' },
  createdAt: now,
})
const hostRef = firestore.collection('hosts').doc(hostId)
const orgRef = firestore.collection('orgs').doc(orgId)

// ── Org-scoped data (AGL-237/239): datasets, contacts, lists ───────────────
const teamDataset = orgRef.collection('datasets').doc('seed-team')
await put(teamDataset, {
  name: 'Team',
  fields: ['name', 'role', 'photo'],
  createdAt: now,
})
const teamRows = [
  ['Avery Quinn', 'Head Baker', 'https://picsum.photos/seed/avery/240'],
  ['Sam Rivera', 'Pastry Chef', 'https://picsum.photos/seed/sam/240'],
  ['Jordan Lee', 'Front of House', 'https://picsum.photos/seed/jordan/240'],
]
for (const [index, [name, role, photo]] of teamRows.entries()) {
  await put(teamDataset.collection('records').doc(`seed-${index}`), {
    values: { name, role, photo },
    order: index,
    createdAt: now,
  })
}

const contacts = [
  ['seed-contact-1', 'wholesale@example.com', 'Robin Wholesale', ['b2b']],
  ['seed-contact-2', 'events@example.com', 'Casey Events', ['events']],
  ['seed-contact-3', 'press@example.com', 'Alex Press', ['press']],
]
for (const [id, email, name, tags] of contacts) {
  await put(orgRef.collection('contacts').doc(id), {
    email,
    name,
    tags,
    sources: { form: true },
    createdAt: now,
  })
}

const list = orgRef.collection('lists').doc('seed-newsletter')
await put(list, { name: 'Newsletter', createdAt: now })
await put(list.collection('members').doc('seed-member-1'), {
  email: 'wholesale@example.com',
  name: 'Robin Wholesale',
  createdAt: now,
})

// ── Host-scoped fixtures ────────────────────────────────────────────────────
// Media at the ROOT (no folderId/folder): the library's default view
// hides foldered items, and its default sort is orderBy createdAt.
const mediaFixtures = [
  ['seed-hero', 'hero.jpg', ['hero', 'home'], 'hero/1200/600'],
  ['seed-team-photo', 'team.jpg', ['team'], 'teamphoto/800/500'],
  ['seed-loaf', 'loaf.jpg', ['bread'], 'loaf/600/600'],
]
for (const [id, fileName, tags, seed] of mediaFixtures) {
  await put(hostRef.collection('media').doc(id), {
    fileName,
    contentType: 'image/jpeg',
    sizeBytes: 120000,
    url: `https://picsum.photos/seed/${seed}`,
    tags,
    alt: fileName.replace('.jpg', ''),
    createdAt: now,
  })
}

// Bookings page queries orderBy('startsAtMs', 'desc') — number required.
await put(hostRef.collection('services').doc('seed-tasting'), {
  name: 'Cake tasting',
  durationMinutes: 30,
  priceUsd: 0,
  description: 'Pick your wedding or event cake over coffee.',
  timezone: 'America/Chicago',
  windows: {
    2: [{ start: 10 * 60, end: 16 * 60 }],
    4: [{ start: 10 * 60, end: 16 * 60 }],
  },
  createdAt: now,
})
const dayMs = 86_400_000
const bookings = [
  ['seed-booking-past', 'Ada Lovelace', 'ada@example.com', -2 * dayMs, 'confirmed'],
  ['seed-booking-next', 'Grace Hopper', 'grace@example.com', 3 * dayMs, 'confirmed'],
]
for (const [id, name, email, offsetMs, status] of bookings) {
  const startsAtMs = Date.now() + offsetMs
  await put(hostRef.collection('bookings').doc(id), {
    serviceId: 'seed-tasting',
    serviceName: 'Cake tasting',
    name,
    email,
    startsAtMs,
    endsAtMs: startsAtMs + 30 * 60_000,
    status,
    createdAt: now,
  })
}

// Content collections + entries.
const blog = hostRef.collection('collections').doc('seed-blog')
await put(blog, { displayName: 'Blog', slug: 'blog', createdAt: now })
await put(blog.collection('entries').doc('seed-sourdough'), {
  title: 'Why our sourdough takes three days',
  slug: 'three-day-sourdough',
  excerpt: 'Slow fermentation is the whole secret.',
  status: 'published',
  body: '## The starter\n\nOur starter is nine years old.',
  publishedAt: Timestamp.now(),
  createdAt: now,
})

// Logic + automations + marketing minimal set.
await put(hostRef.collection('variables').doc('seed-site-name'), {
  name: 'siteName',
  type: 'text',
  value: 'Demo Bakery',
  createdAt: now,
})
await put(hostRef.collection('functions').doc('seed-order-total'), {
  name: 'OrderTotal',
  parameters: [{ name: 'Qty', type: 'number', required: true }],
  variables: [{ name: 'Total', type: 'number' }],
  operations: [{ set: 'Total', expression: 'Qty * 4' }],
  returnValue: 'Total',
  createdAt: now,
})
await put(hostRef.collection('workflows').doc('seed-quote'), {
  name: 'DozenQuote',
  steps: [
    { functionId: 'seed-order-total', functionName: 'OrderTotal', args: ['12'], resultName: 'dozenPrice' },
  ],
  returnValue: 'dozenPrice',
  trigger: { event: 'formSubmission' },
  createdAt: now,
})
await put(hostRef.collection('actions').doc('seed-welcome'), {
  name: 'Form thank-you',
  trigger: { event: 'formSubmission' },
  steps: [
    {
      type: 'siteAlert',
      severity: 'success',
      message: 'Thanks — we read every message the same day!',
    },
  ],
  enabled: true,
  createdAt: now,
})
await put(hostRef.collection('overlays').doc('seed-bar'), {
  kind: 'bar',
  name: 'Welcome bar',
  enabled: true,
  bar: { text: 'Fresh sourdough every morning', dismissible: true },
  order: 0,
  // Engagement counters (AGL-271) so the marketing hub's Engagement
  // column and At-a-glance rollup show real numbers.
  stats: { impressions: 120, clicks: 14, dismissals: 9 },
  createdAt: now,
})
await put(hostRef.collection('campaigns').doc('seed-campaign'), {
  subject: 'Welcome to the bakery',
  body: 'Hi {{firstName|there}} — thanks for signing up!',
  audience: 'leads',
  status: 'sent',
  sentAt: Timestamp.now(),
  sentBy: E2E_UID,
  stats: { recipients: 2, sent: 2, opens: 1, clicks: 1 },
})
// Scheduled send (AGL-272): renders the Scheduled chip + Cancel action.
await put(hostRef.collection('campaigns').doc('seed-campaign-scheduled'), {
  subject: 'Holiday preorder window',
  body: 'Hi {{firstName|there}} — preorders open next week!',
  audience: 'leads',
  status: 'scheduled',
  sendAtMs: Date.now() + 7 * dayMs,
  scheduledAt: Timestamp.now(),
  scheduledBy: E2E_UID,
})
// Draft A/B experiment (AGL-252/273): business plan unlocks the card.
await put(hostRef.collection('experiments').doc('seed-experiment'), {
  name: 'Hero copy test',
  status: 'draft',
  target: 'screen',
  screenId: 'seed-screen',
  variants: [
    { id: 'a', name: 'A (control)', weight: 1 },
    { id: 'b', name: 'B', weight: 1 },
  ],
  goal: { event: 'formSubmission' },
  autoWinner: { minExposures: 200, confidence: 0.95 },
  createdAt: now,
})
await put(hostRef.collection('leads').doc('seed-lead-1'), {
  email: 'wholesale@example.com',
  source: 'signup',
  createdAt: now,
})
// A notification (AGL-259/267 taxonomy) so the notifications page's
// feed and category mute switches have content.
await put(
  firestore
    .collection('users')
    .doc(E2E_UID)
    .collection('notifications')
    .doc('seed-notification'),
  {
    type: 'billing.usage',
    title: "You're above 80% of your monthly email sends quota",
    body: '401 of 500 used — upgrade in Billing to raise the limit.',
    link: '/org/billing',
    orgId,
    createdAt: now,
  },
)

console.log(
  `Done — ${written} docs. user=${E2E_EMAIL} (uid ${E2E_UID}, staff) ` +
    `org=${orgId} host=${hostId} project=${projectId}`,
)
