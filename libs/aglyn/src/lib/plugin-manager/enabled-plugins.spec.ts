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
  DEFAULT_ENABLED_PLUGINS,
  FIRST_PARTY_PLUGINS,
  isPluginEnabled,
  resolveEnabledPlugins,
} from './enabled-plugins'

describe('resolveEnabledPlugins (AGL-416)', () => {
  it('defaults to every first-party plugin when the field is absent', () => {
    expect(resolveEnabledPlugins(undefined)).toEqual([
      ...DEFAULT_ENABLED_PLUGINS,
    ])
    expect(resolveEnabledPlugins({})).toEqual([...DEFAULT_ENABLED_PLUGINS])
  })

  it('respects an explicit list', () => {
    const enabled = resolveEnabledPlugins({ enabledPlugins: ['bookings'] })
    expect(enabled).toContain('bookings')
    expect(enabled).not.toContain('commerce')
  })

  it('unions always-on plugins back in', () => {
    const enabled = resolveEnabledPlugins({ enabledPlugins: [] })
    for (const plugin of FIRST_PARTY_PLUGINS.filter((p) => p.alwaysOn)) {
      expect(enabled).toContain(plugin.id)
    }
  })

  it('keeps unknown (marketplace realm) ids and dedupes', () => {
    const enabled = resolveEnabledPlugins({
      enabledPlugins: ['acme-widgets', 'acme-widgets', 'mui'],
    })
    expect(enabled.filter((id) => id === 'acme-widgets')).toHaveLength(1)
    expect(enabled.filter((id) => id === 'mui')).toHaveLength(1)
  })

  it('isPluginEnabled answers per id', () => {
    expect(isPluginEnabled({ enabledPlugins: ['data'] }, 'data')).toBe(true)
    expect(isPluginEnabled({ enabledPlugins: ['data'] }, 'email')).toBe(false)
    expect(isPluginEnabled(undefined, 'email')).toBe(true)
  })
})
