/**
 * @license
 * Copyright 2021 Aglyn LLC
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
  buildOptions,
  DEFAULT_OPTIONS,
  HoverContext,
  HoverOptions,
} from './hover-context'
import { ElementType, Fragment, MouseEventHandler, ReactNode, useCallback, useState } from 'react'
import { HoverComponent } from '../components/hover.component'

export interface HoverContextProviderProps {
  defaultOptions?: HoverOptions
  children?: ReactNode
  component: ElementType<{
    open: boolean
    options: HoverOptions
    onClose: MouseEventHandler<unknown>
    onCancel: MouseEventHandler<unknown>
    onConfirm: MouseEventHandler<unknown>
  }>
}

export function HoverContextProvider(props: HoverContextProviderProps) {
  const { children, defaultOptions = {}, component: Component } = props
  const [options, setOptions] = useState(()=>({ ...DEFAULT_OPTIONS, ...defaultOptions }))
  const [resolveReject, setResolveReject] = useState(()=>[])
  const open = resolveReject.length === 2

  const hover = useCallback(
    (options: HoverOptions) => {
      const opts = { ...options }
      return new Promise((resolve, reject) => {
        setOptions(buildOptions(defaultOptions, opts))
        setResolveReject([resolve, reject])
      })
    },
    [defaultOptions]
  )

  const close = useCallback(() => {
    setResolveReject([])
  }, [])

  const cancel = useCallback(() => {
    const [, reject] = resolveReject
    reject()
    close()
  }, [resolveReject])

  const confirm = useCallback(() => {
    const [resolve] = resolveReject
    resolve()
    close()
  }, [resolveReject])

  return (
    <Fragment>
      <HoverContext.Provider value={{ hover, close }}>
        {children}
      </HoverContext.Provider>
      <Component
        open={open}
        options={options}
        onClose={close}
        onCancel={cancel}
        onConfirm={confirm}
      />
    </Fragment>
  )
}
HoverContextProvider.displayName = 'HoverContextProvider'
HoverContextProvider.defaultProps = {
  component: HoverComponent,
}
export default HoverContextProvider
