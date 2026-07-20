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

// The docs Vercel project deploys from apps/docs; the canonical domain lives
// in apps/docs/docusaurus.config.ts — keep the two in sync.
export const DOCS_BASE_URL = (
  process.env.NEXT_PUBLIC_AGLYN_DOCS_URL || 'https://docs.aglyn.com'
).replace(/\/+$/, '')

/** Absolute docs URL for a docs-site path (docs serve from the site root). */
export function buildDocsUrl(path = '/'): string {
  return `${DOCS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
