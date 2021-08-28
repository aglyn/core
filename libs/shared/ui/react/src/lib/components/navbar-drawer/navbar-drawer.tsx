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

import { createStyles, withStyles, ExtendPropsOfWithStyles } from '@aglyn/shared/ui/themes'

import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@material-ui/core/AppBar'
import MuiDrawer, { DrawerProps as MuiDrawerProps } from '@material-ui/core/Drawer'
import Toolbar, { ToolbarProps as MuiToolbarProps } from '@material-ui/core/Toolbar'

import clsx from 'clsx'
import { forwardRef, ReactNode, useRef, Ref } from 'react'
import useCombinedRefs from '../../hooks/use-combined-refs'
import ElevationScroll from '../elevation-scroll/elevation-scroll'


export const navbarDrawerStyles = (theme) => createStyles({
  root: {},
  menu: {},
  appBar: {borderBottom: `1px solid ${theme.palette.divider}`},
  paper: {
    width: 620,
    maxWidth: '100%',
  },
  left: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    height: '100%',
    width: '100%',
    overflow: 'auto',
  },
})

/* eslint-disable-next-line */
export interface NavbarDrawerProps extends ExtendPropsOfWithStyles<Partial<MuiDrawerProps>, typeof navbarDrawerStyles> {
  appBarLeft?: ReactNode
  appBarRight?: ReactNode
  innerContentRef?: Ref<HTMLDivElement>
  AppBarProps?: Partial<MuiAppBarProps>
  ToolbarProps?: Partial<MuiToolbarProps>
}

const NavbarDrawerRaw = forwardRef<any, NavbarDrawerProps>(
  function RefRenderFn(props, ref) {
    const {
      classes,
      children,
      innerContentRef,
      appBarLeft,
      appBarRight,
      className,
      AppBarProps,
      ToolbarProps,
      ...rest
    } = props

    const localContentRef = useRef<HTMLDivElement>()
    const contentRef = useCombinedRefs(localContentRef, innerContentRef)

    return (
      <MuiDrawer
        ref={ref}
        anchor="right"
        className={clsx(classes.root, className)}
        classes={{paper: classes.paper}}
        {...rest}
      >
        <ElevationScroll target={localContentRef.current}>
          <MuiAppBar
            className={classes.appBar}
            color="default"
            position="relative"
            variant="elevation"
            {...AppBarProps}
          >
            <Toolbar {...ToolbarProps}>
              <div className={classes.left}>{appBarLeft}</div>
              <div className={classes.right}>{appBarRight}</div>
            </Toolbar>
          </MuiAppBar>
        </ElevationScroll>
        <div ref={contentRef} className={classes.content}>
          {children}
        </div>
      </MuiDrawer>
    )
  },
)

NavbarDrawerRaw.displayName = 'NavbarDrawer'

export const NavbarDrawer = withStyles(navbarDrawerStyles, {name: 'NavbarDrawer'})(NavbarDrawerRaw)
export default NavbarDrawer
