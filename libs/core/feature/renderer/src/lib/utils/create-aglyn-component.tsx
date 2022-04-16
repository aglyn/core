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

import {
  type AglynComponentSchema,
  COMPONENT_ELEMENT_TYPE,
  type ComponentRegisterPayload,
  type IAglynComponent,
  MODULE_TYPE,
  OF_KIND,
  OF_TYPE,
} from '@aglyn/core-data-framework'
import type {JSXElementConstructor} from '@aglyn/shared-data-types'
import {styled} from '@aglyn/shared-feature-themes'
import {ErrorBoundaryComponent, type ErrorBoundaryProps, ReactIs} from '@aglyn/shared-ui-jsx'
import {copy, getDisplayName} from '@aglyn/shared-util-tools'
import {hoistNonReactStatics, pascalCase} from '@aglyn/shared-util-vendor'
import {forwardRef, useMemo} from 'react'


export function createAglynStyledComponent<P>(
  component: JSXElementConstructor<P>,
  styledOptions?: AglynComponentSchema<P>['emotion']['options'],
) {
  return styled(component, {...styledOptions})<P>({})
}

export function createAglynComponent<P>(
  schema: AglynComponentSchema<P>,
  component: JSXElementConstructor<P>,
  options?: Partial<ErrorBoundaryProps>,
): ComponentRegisterPayload<P> {
  const {componentId, bundleId, emotion} = copy(schema)
  const {onCatch, fallback} = {...options}
  const displayName = getDisplayName(component, pascalCase(componentId))
  const shouldNotBeStyled = emotion?.disable

  const AglynComponent = forwardRef<any, P>(
    function RefRenderFn(props, ref) {

      const Component = useMemo(() => {
        if (shouldNotBeStyled) return component
        return createAglynStyledComponent<P>(component, {
          name: displayName,
          ...emotion?.options,
        })
      }, [])

      return (
        <ErrorBoundaryComponent
          ref={ref}
          fallback={fallback}
          onCatch={onCatch}
        >
          {!ReactIs.isValidElementType(Component) ? Component : (
            <Component {...props as P} />
          )}
        </ErrorBoundaryComponent>
      )
    },
  ) as IAglynComponent<P>

  AglynComponent.displayName = `AglynComponent(${displayName})`
  AglynComponent.componentId = componentId
  AglynComponent.bundleId = bundleId
  AglynComponent.aglyn = true
  AglynComponent[OF_TYPE] = MODULE_TYPE
  AglynComponent[OF_KIND] = COMPONENT_ELEMENT_TYPE
  hoistNonReactStatics(AglynComponent)

  return {
    component: AglynComponent,
    schema,
  }
}

export default createAglynComponent
