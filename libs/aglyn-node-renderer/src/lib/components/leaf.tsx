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

import * as Aglyn from '@aglyn/aglyn'
import { styled } from '@aglyn/shared-ui-theme'
import { forwardRef, useMemo } from 'react'
import { isValidElementType } from 'react-is'

const DefaultComponent = styled('div')({})

export interface LeafProps {
  component: any
  children?: any
  nodeSchema: Aglyn.NodeSchema
  cmpSchema?: Aglyn.ComponentSchema
}

const Leaf = forwardRef<any, LeafProps>((props, ref) => {
  const { component, children, nodeSchema, cmpSchema } = props

  const Component = useMemo(() => {
    return isValidElementType(component) ? component : DefaultComponent
  }, [component])

  const resolved = useMemo(() => {
    const data = cmpSchema?.resolveProps && cmpSchema?.resolveProps(nodeSchema)
    return data || nodeSchema.props
  }, [cmpSchema, nodeSchema])

  const merged = useMemo(() => {
    const { sx } = { ...nodeSchema }
    return { ...resolved, sx: sx }
  }, [nodeSchema, resolved])

  return (
    <Component
      ref={ref}
      key={nodeSchema.$id}
      data-aglyn={`leaf:${nodeSchema.$id}`}
      {...merged}
    >
      {children || nodeSchema.props?.children}
    </Component>
  )
})
Leaf.displayName = 'Leaf'
Leaf.defaultProps = {}
Leaf.aglyn = true

export { Leaf }
export default Leaf
