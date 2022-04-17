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
import {styled} from '@aglyn/shared-feature-themes'
import {ErrorBoundaryComponent, type ErrorBoundaryProps, ReactIs} from '@aglyn/shared-ui-jsx'
import {copy, getDisplayName} from '@aglyn/shared-util-tools'
import {hoistNonReactStatics, pascalCase} from '@aglyn/shared-util-vendor'
import {forwardRef, type ReactNode, useMemo} from 'react'


export function createAglynStyledComponent<P>(
  ...args: Parameters<typeof styled>
) {
  const [component, styledOptions] = args
  return styled(component, {...styledOptions})<P>({})
}

export function createAglynComponent<P>(
  schema: AglynComponentSchema<P>,
  component: Parameters<typeof styled>[0],
  options?: Partial<ErrorBoundaryProps>,
): ComponentRegisterPayload<P> {
  const {componentId, bundleId, emotion} = copy(schema)
  const {onCatch, fallback} = {...options}
  const displayName = getDisplayName(component, pascalCase(componentId))
  const shouldNotBeStyled = emotion?.disable

  const CreateAglynComponent = forwardRef<any, P>(
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
          {!ReactIs.isValidElementType(Component) ? (Component as unknown as ReactNode) : (
            <Component {...props as P} />
          )}
        </ErrorBoundaryComponent>
      )
    },
  ) as IAglynComponent<P>

  CreateAglynComponent.displayName = `CreateAglynComponent(${displayName})`
  CreateAglynComponent.componentId = componentId
  CreateAglynComponent.bundleId = bundleId
  CreateAglynComponent.aglyn = true
  CreateAglynComponent[OF_TYPE] = MODULE_TYPE
  CreateAglynComponent[OF_KIND] = COMPONENT_ELEMENT_TYPE
  CreateAglynComponent && hoistNonReactStatics(CreateAglynComponent)

  return {
    component: CreateAglynComponent,
    schema,
  }
}

export default createAglynComponent
