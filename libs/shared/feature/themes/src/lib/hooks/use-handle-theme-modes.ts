/**
 * @license
 * Copyright 2022 Aglyn LLC
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

import useMediaQuery from '@mui/material/useMediaQuery'
import Cookie from 'js-cookie'
import {useCallback, useMemo, useState} from 'react'


export type ThemeMode = 'light' | 'dark'
export type UseThemeMode = [
  mode: 'light' | 'dark',
  toggleThemeMode: (mode?: ThemeMode) => void
]

export function useHandleThemeModes(defaultMode?: ThemeMode): UseThemeMode {
  const prefDark = useMediaQuery('(prefers-color-scheme: dark)')
  const cookieMode = Cookie.get('theme-color-scheme')
  const defaultValue = defaultMode || cookieMode || (prefDark ? 'dark' : 'light') || null
  const [localMode, setLocalMode] = useState<string | null>(defaultValue)
  const mode = useMemo(() => {
    if (localMode) return localMode === 'dark' ? 'dark' : 'light'
    return prefDark ? 'dark' : 'light'
  }, [prefDark, localMode])

  const toggleThemeMode = useCallback((mode?: ThemeMode) => {
    const override = mode === 'light' || mode === 'dark' ? mode : null
    setLocalMode(prev => {
      const _mode = override || (prev === 'dark' ? 'light' : 'dark')
      Cookie.set('theme-color-scheme', _mode, {
        expires: 365,
      })
      return _mode
    })
  }, [])

  return useMemo(() => [mode, toggleThemeMode], [mode, toggleThemeMode])
}

export default useHandleThemeModes
