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

/**
 * Per-org plugin enablement (AGL-416): `org.enabledPlugins` is the
 * switchboard that decides which plugins LOAD for a workspace — the loader
 * (AGL-417) dynamically imports only these. It composes with (not replaces)
 * the existing gates: a surface renders when its plugin is enabled AND its
 * `featureFlag` entitlement resolves; marketplace/community listings keep
 * their per-host/org `installs` docs on top.
 *
 * This catalog intentionally knows ids and labels only — package names live
 * in `plugins.config.json` (codegen), so core stays free of plugin imports.
 */

export interface FirstPartyPlugin {
  /** Stable plugin id — persisted in `org.enabledPlugins`; never rename. */
  id: string
  /** Console-facing display name. */
  label: string
  /** Always loaded regardless of the org switchboard (base components). */
  alwaysOn?: boolean
  /** One-line description for the org-settings toggle list. */
  description?: string
}

export const FIRST_PARTY_PLUGINS: readonly FirstPartyPlugin[] = [
  {
    id: 'mui',
    label: 'Components',
    alwaysOn: true,
    description: 'The base component and theme library every site builds on.',
  },
  { id: 'bookings', label: 'Bookings', description: 'Services, open slots, and paid bookings.' },
  { id: 'commerce', label: 'Commerce', description: 'Products, carts, checkout, orders, POS.' },
  { id: 'community', label: 'Community', description: 'Marketplace listings, templates, and installs.' },
  { id: 'contacts', label: 'Contacts', description: 'People, segments, and interactions.' },
  { id: 'data', label: 'Data', description: 'Datasets, records, and CSV import/export.' },
  { id: 'email', label: 'Email', description: 'Designed emails and campaign sending.' },
  { id: 'events-calendar', label: 'Events Calendar', description: 'Event lists and calendars.' },
  { id: 'inbox', label: 'Inbox', description: 'Form submissions and lead inbox.' },
  { id: 'logic', label: 'Logic', description: 'Variables, functions, and reference health.' },
  { id: 'marketing', label: 'Marketing', description: 'Overlays, campaigns, and experiments.' },
  { id: 'redirects', label: 'Redirects', description: 'URL redirect rules.' },
  { id: 'workflows', label: 'Workflows', description: 'Automations, webhooks, and run logs.' },
] as const

/** Ids loaded for orgs that have never touched the switchboard. */
export const DEFAULT_ENABLED_PLUGINS: readonly string[] =
  FIRST_PARTY_PLUGINS.map((plugin) => plugin.id)

const ALWAYS_ON: readonly string[] = FIRST_PARTY_PLUGINS.filter(
  (plugin) => plugin.alwaysOn,
).map((plugin) => plugin.id)

/**
 * The org's effective enabled-plugin set. Absent field → every first-party
 * plugin (existing orgs keep working untouched); always-on ids are unioned
 * in so the base component library can't be switched off. Unknown ids are
 * kept — realm-trusted marketplace plugins (AGL-420) ride the same field.
 */
export function resolveEnabledPlugins(
  org?: { enabledPlugins?: string[] } | null,
): string[] {
  const configured = org?.enabledPlugins
  const base = Array.isArray(configured)
    ? configured.map(String)
    : [...DEFAULT_ENABLED_PLUGINS]
  return Array.from(new Set([...ALWAYS_ON, ...base]))
}

export function isPluginEnabled(
  org: { enabledPlugins?: string[] } | null | undefined,
  pluginId: string,
): boolean {
  return resolveEnabledPlugins(org).includes(pluginId)
}
