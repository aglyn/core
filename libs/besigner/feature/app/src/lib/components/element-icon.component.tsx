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
import { ICON_VARIANT_ELEMENT } from '@aglyn/shared-data-enums'
import { MdiIcon, type MdiIconProps } from '@aglyn/shared-ui-mdi-jsx'
import { mergeSxProps } from '@aglyn/shared-ui-theme'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

export interface ElementIconProps extends MdiIconProps {
  component: Aglyn.ComponentSchema
}

const ElementIcon = (props: ElementIconProps, ref: any) => {
  const { component, sx, ...rest } = props
  const icon = component?.icon
  const iconProps = useMemo(
    () => ({
      ...icon,
      path: icon?.path || ICON_VARIANT_ELEMENT.path,
      sx: mergeSxProps(icon?.sx, sx),
    }),
    [icon, sx],
  )

  return (
    <MdiIcon
      ref={ref}
      fontSize="inherit"
      color="inherit"
      {...iconProps}
      {...rest}
    />
  )
}
ElementIcon.displayName = 'ElementIconComponent'
ElementIcon.defaultProps = {}

const ElementIconComponent = observer(ElementIcon, { forwardRef: true })

export { ElementIconComponent }
export default ElementIconComponent
