/**
 * @license
 * Copyright 2023 Aglyn LLC
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

import generateComponentClassKeys from '@aglyn/shared-ui-theme/util/generate-component-class-keys'
import _isEqualitySameType from '@aglyn/shared-util-guards/_is-equality-same-type'
import { type ClientRect } from '@dnd-kit/core'
import { styled } from '@mui/material'
import clsx from 'clsx'
import { forwardRef, HTMLProps } from 'react'
import { REGION } from '../../utils/droppable-region-utils'

const classes = generateComponentClassKeys('DropIndicator', [
  'root',
  'line',
  'handle',
])

type IndicatorProps = HTMLProps<HTMLDivElement> & {
  variant?: 'vertical' | 'horizontal'
}

const Indicator = styled('div', {
  name: 'DropIndicator',
  shouldForwardProp: (propName) =>
    !_isEqualitySameType(propName, null, 'variant', 'visible'),
})<IndicatorProps>(({ theme, variant }) => {
  const vertical = variant === 'vertical'

  return {
    position: 'absolute',
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',

    [`& .${classes.line}`]: {
      backgroundColor: theme.palette.secondary.main,
      flexGrow: 1,
      width: !vertical ? undefined : 3,
      height: !vertical ? 3 : undefined,
      display: 'block',
      content: '""',
    },
    [`& .${classes.handle}`]: {
      backgroundColor: theme.palette.surface.main,
      borderRadius: 8,
      border: `1px solid ${theme.palette.secondary.dark}`,
      width: 8,
      height: 8,
      display: 'block',
      content: '""',
    },
  }
})

export interface DropIndicatorProps
  extends JSX.ComponentProps<typeof Indicator> {
  visible?: boolean
  rect: ClientRect
  region: REGION
}

export const DropIndicator = forwardRef<HTMLDivElement, DropIndicatorProps>(
  (props, ref) => {
    const { style, visible, region, rect, ...rest } = props

    const styles = {
      [REGION.LEFT]: {
        left: rect.left - 4,
        top: rect.top - 4,
        height: rect.height + 8,
      },
      [REGION.TOP]: {
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
      },
      [REGION.RIGHT]: {
        left: rect.left + rect.width - 4,
        top: rect.top - 4,
        height: rect.height + 8,
      },
      [REGION.BOTTOM]: {
        left: rect.left - 4,
        top: rect.top + rect.height - 4,
        width: rect.width + 8,
      },
      [REGION.CHILDREN]: {
        left: rect.left + 4,
        top: rect.top + rect.height / 2 - 4,
        width: rect.width - 8,
      },
    }

    const vertical = region === REGION.LEFT || region === REGION.RIGHT

    return (
      <Indicator
        ref={ref}
        className={clsx(classes.root)}
        variant={vertical ? 'vertical' : 'horizontal'}
        style={{
          ...styles[region],
          visibility: visible ? 'visible' : 'hidden',
          ...style,
        }}
        {...rest}
      >
        <div className={classes.handle} />
        <div className={classes.line} />
        <div className={classes.handle} />
      </Indicator>
    )
  },
)
DropIndicator.displayName = 'DropIndicator'

export default DropIndicator
