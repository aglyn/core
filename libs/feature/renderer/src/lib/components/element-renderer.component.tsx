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

import { AglynComponentElementData } from '@aglyn/core-data-framework'
import { AnyProps } from '@aglyn/shared-data-types'
import { ReactIs } from '@aglyn/shared-ui-jsx'
import { _isArrEmpty, _isFnT } from '@aglyn/shared-util-guards'
import { yes } from '@aglyn/shared-util-tools'
import { deepEqual } from '@aglyn/shared-util-vendor'
import { ComponentType, forwardRef, memo } from 'react'
import useAglynComponent from '../hooks/use-aglyn-component'
import useAglynComponentSchema from '../hooks/use-aglyn-component-schema'
import { ElementsRendererComponent } from './elements-renderer.component'


export interface ElementRendererComponentProps extends AnyProps {
  elementData: AglynComponentElementData
  elementRendererComponent?: ComponentType<ElementRendererComponentProps>
}

const ElementRendererComponentRaw = forwardRef<any, ElementRendererComponentProps>(
  function RefRenderFn(_props, ref) {
    const {
      elementData,
      elementRendererComponent: elementRendererComponentProp,
      children: childrenProp,
      ...rest
    } = _props

    const elementRendererComponent = elementRendererComponentProp || ElementRendererComponent
    const {componentId, bundleId} = elementData
    const Component = useAglynComponent({componentId, bundleId})
    const schema = useAglynComponentSchema({componentId, bundleId})
    const resolveProps = schema?.renderFlags?.resolveProps
    const {children, ...elemProps}: AnyProps = (_isFnT(resolveProps)
      ? resolveProps.call(undefined, elementData)
      : elementData.props) || {}
    const innerRef = yes(
      !schema?.renderFlags?.elementRef?.disable
      && schema?.renderFlags?.elementRef?.innerRef,
    ) ? {innerRef: ref} : {}

    return ReactIs.isValidElementType(Component) ? (
      <Component ref={ref} {...elemProps} {...innerRef} {...rest}>
        {!_isArrEmpty(elementData.elements || []) ? (
          <ElementsRendererComponent
            elementRendererComponent={elementRendererComponent}
            elements={elementData.elements}
          />
        ) : null}
        {children}
        {childrenProp}
      </Component>
    ) : (<>'Error loading element component'</>)
  },
)

ElementRendererComponentRaw.displayName = 'ElementRendererComponent'
ElementRendererComponentRaw.defaultProps = {
  elementData: {},
  children: null,
}

export const ElementRendererComponent = memo(ElementRendererComponentRaw, (prev, next) => {
  return deepEqual(next.elementData, prev.elementData)
})

export default ElementRendererComponent
