/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import {
  buildOptions,
  DEFAULT_OPTIONS,
  ElementDrawerContext,
  ElementDrawerOptions,
} from '../contexts/element-drawer.context'
import {
  ElementType,
  Fragment,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useState,
} from 'react'
import ElementDrawerComponent from './element-drawer.component'


export interface ElementDrawerProviderComponentProps {
  defaultOptions?: ElementDrawerOptions
  children?: ReactNode
  component: ElementType<{
    open: boolean
    options: ElementDrawerOptions
    onClose: MouseEventHandler<unknown>
    onCancel: MouseEventHandler<unknown>
    onConfirm: MouseEventHandler<unknown>
  }>
}

export function ElementDrawerProviderComponent(props: ElementDrawerProviderComponentProps) {
  const { children, defaultOptions = {}, component: Component } = props
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...defaultOptions })
  const [resolveReject, setResolveReject] = useState([])
  const [resolve, reject] = resolveReject

  const elementDrawer = useCallback((options: ElementDrawerOptions = {}) => {
    return new Promise((resolve, reject) => {
      setOptions(buildOptions(defaultOptions, options))
      setResolveReject([resolve, reject])
      console.log('set resolve')
    })
  }, [defaultOptions])

  const handleClose = useCallback((...args) => {
    console.log('handle close', args)
    // setResolveReject([])
  }, [])

  const handleCancel = useCallback((...args) => {
    console.log('handle cnacel', ...args)
    reject()
    handleClose()
  }, [reject, handleClose])

  const handleConfirm = useCallback((...args) => {
    console.log('handle confirm', args)
    resolve()
    // handleClose()
  }, [resolve, handleClose])

  return (
    <Fragment>
      <ElementDrawerContext.Provider value={{ elementDrawer }}>
        {children}
      </ElementDrawerContext.Provider>
      <Component
        open={resolveReject.length === 2}
        options={options}
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Fragment>
  )
}

ElementDrawerProviderComponent.defaultProps = {
  component: ElementDrawerComponent,
}
export default ElementDrawerProviderComponent
