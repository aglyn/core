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

import type { JSXComponentType } from '@aglyn/shared-data-types'
import { _isArr, _isNull, _isStrT } from '@aglyn/shared-util-guards'
import { getDisplayName } from '@aglyn/shared-util-tools'
import { hoistNonReactStatics } from '@aglyn/shared-util-vendor'
import { CssBaseline, useMediaQuery } from '@mui/material'
import { get as getCookie, set as setCookie } from 'js-cookie'
import {
  createContext,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react'
import { createTheme, type Theme, ThemeProvider } from '../../vendor/mui'

export type ThemeMode = 'light' | 'dark' | 'system' | null
export type UseThemeMode = [
  themeMode: ThemeMode,
  toggleThemeMode: (event: SyntheticEvent<any>, to?: ThemeMode) => void,
  themeMode: ThemeMode
]

export const COOKIE_THEME_KEY = 'theme-color-scheme'
export const ThemeContextDispatch = createContext<UseThemeMode>(null)

export function useThemeMode() {
  return useContext(ThemeContextDispatch)
}

function getCookieThemeMode(): ThemeMode {
  const cookieMode = getCookie(COOKIE_THEME_KEY)
  if (cookieMode === 'dark' || cookieMode === 'light') {
    return cookieMode
  }
  return null
}

export function useCookieThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const ref = useRef<ThemeMode>(getCookieThemeMode())

  /**
   * Update ref value on each paint if changed
   */
  useEffect(() => {
    const cookieMode = getCookieThemeMode()
    if (cookieMode !== ref.current) {
      ref.current = cookieMode
    }
  })

  const setCookieThemeMode = useCallback((newMode: ThemeMode) => {
    setCookie(COOKIE_THEME_KEY, newMode, {expires: 365})
  }, [])

  return useMemo(() => [ref.current, setCookieThemeMode], [setCookieThemeMode])
}

export function useThemeModeState(): UseThemeMode {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [cookieMode, setCookieMode] = useCookieThemeMode()

  const systemTheme = useMemo<ThemeMode>(() => {
    return (prefersDark ? 'dark' : 'light')
  }, [prefersDark])

  const themeMode = useMemo<ThemeMode>(() => {
    return cookieMode || systemTheme
  }, [cookieMode, systemTheme])

  const toggleThemeMode = useCallback((
    event: SyntheticEvent<any>,
    to?: ThemeMode
  ) => {
    let newMode: ThemeMode

    switch (true) {
      case _isNull(to):
      case to === 'system':
        newMode = 'system'
        break
      case to === 'dark':
        newMode = 'dark'
        break
      case to === 'light':
        newMode = 'light'
        break
      case _isNull(cookieMode):
      case cookieMode === 'system':
        newMode = 'light'
        break
      case cookieMode === 'dark':
        newMode = 'system'
        break
      case cookieMode === 'light':
        newMode = 'dark'
        break
      default:
        newMode = 'system'
        break
    }

    setCookieMode(newMode)
  }, [cookieMode, setCookieMode])

  return useMemo(
    () => [themeMode, toggleThemeMode, cookieMode],
    [themeMode, toggleThemeMode, cookieMode]
  )
}

export type WithThemeProviderOptions = {
  theme: Theme | [lightTheme: Theme, darkTheme: Theme]
  disableCssBaseline?: boolean
}

function createWithThemeProvider(options: WithThemeProviderOptions) {
  const { theme, disableCssBaseline } = options
  const [lightTheme, darkTheme] = !_isArr(theme)
    ? [theme, createTheme({ ...theme, palette: { ...theme?.palette, mode: 'dark' } })]
    : theme

  return function withThemeProvider<P>(WrappedComponent: JSXComponentType<P>) {
    const displayName = getDisplayName(WrappedComponent)

    const WithThemeProvider = forwardRef<any, P>(function RefRenderFn(props, ref) {
      const { ...rest } = props
      const ThemeModeState = useThemeModeState()
      const activeTheme = useMemo<Theme>(() => {
        const themeMode = ThemeModeState[0]
        return themeMode === 'dark' ? darkTheme : lightTheme
      }, [ThemeModeState])
      return (
        <ThemeContextDispatch.Provider value={ThemeModeState}>
          <ThemeProvider theme={activeTheme}>
            {disableCssBaseline ? (
              <WrappedComponent ref={ref} {...rest} />
            ) : (
              <CssBaseline enableColorScheme>
                <WrappedComponent ref={ref} {...rest} />
              </CssBaseline>
            )}
          </ThemeProvider>
        </ThemeContextDispatch.Provider>
      )
    })
    WithThemeProvider.displayName = `WithThemeProvider(${displayName})`
    hoistNonReactStatics(WithThemeProvider, WrappedComponent)

    return WithThemeProvider
  }
}
export { createWithThemeProvider }
export default createWithThemeProvider
