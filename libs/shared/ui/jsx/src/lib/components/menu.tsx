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

import {mergeSxProps} from '@aglyn/shared-feature-themes'
import {
  Box,
  type BoxProps,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  type MenuItemProps as MuiMenuItemProps,
  type MenuProps as MuiMenuProps,
} from '@mui/material'
import {Children, cloneElement, forwardRef, type MouseEvent, useState} from 'react'


const ITEM_HEIGHT = 48

type State = {
  anchorEl: null | HTMLElement
  mouseX: null | number
  mouseY: null | number
}
const initialState: State = {
  anchorEl: null,
  mouseX: null,
  mouseY: null,
}

/* eslint-disable-next-line */
export interface MenuProps extends BoxProps {
  items: Array<MuiMenuItemProps>
  context?: boolean
  MenuProps?: Partial<MuiMenuProps>
}

export const Menu = forwardRef<any, MenuProps>(function RefRenderFn(props, ref) {
  const {children, items, context, className, sx, MenuProps, ...rest} = props

  const [state, setState] = useState<State>(initialState)
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (context) {
      event.preventDefault()
    }
    setState({
      anchorEl: event.currentTarget,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    })
  }
  const handleClose = () => setState(initialState)
  const open = Boolean(state.anchorEl || state.mouseY)
  const child = Children.only(children)
  const cloned = cloneElement(child as any, {onClick: handleClick})

  return (
    <Box
      component={'div'}
      ref={ref}
      onContextMenu={handleClick}
      sx={mergeSxProps({
        cursor: context ? 'context-menu' : undefined,
      }, sx)}
      {...(context ? {onContextMenu: handleClick} : {})}
      {...rest}
    >
      {cloned}
      <MuiMenu
        PaperProps={
          context
            ? undefined
            : {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                minWidth: '20ch',
              },
            }
        }
        anchorEl={context ? undefined : state.anchorEl}
        anchorOrigin={
          context
            ? undefined
            : {
              vertical: 'top',
              horizontal: 'left',
            }
        }
        anchorPosition={
          !context || !state.mouseY
            ? undefined
            : {
              top: state.mouseY,
              left: state.mouseX,
            }
        }
        anchorReference={context ? 'anchorPosition' : undefined}
        // getContentAnchorEl={null}
        open={open}
        transformOrigin={
          context
            ? undefined
            : {
              vertical: 'top',
              horizontal: 'right',
            }
        }
        onClose={handleClose}
        {...MenuProps}
      >
        {items.map((item: any, key) => (
          <MuiMenuItem
            key={item?.id ?? item?.key ?? key}
            {...item}
            // onClick={(e) => {
            //   handleClose()
            //   item.onClick && item.onClick(e)
            // }}
          />
        ))}
      </MuiMenu>
    </Box>
  )
})

Menu.displayName = 'Menu'
Menu.defaultProps = {
  items: [],
}

export default Menu
