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

import { styled } from '@aglyn/shared-feature-themes'
import Stack, { StackProps } from '@mui/material/Stack'
import { forwardRef } from 'react'
import { AppBarGlobalComponent } from './app-bar-global.component'
import { AppBarModifyComponent } from './app-bar-modify.component'
import { ToolboxLeftComponent } from './toolbox-left.component'
import { ToolboxRightComponent } from './toolbox-right.component'
import { ViewportRootComponent } from './viewport-root.component'


const Editor = styled(Stack, {name: 'AglynEditor'})({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
})

export interface EditorComponentProps extends StackProps {}

const EditorComponentRaw = forwardRef<any, EditorComponentProps>(function RefRenderFn(props, ref) {
  const {children, ...rest} = props

  return (
    <Editor
      ref={ref}
      id="aglyn:besigner"
      direction="column"
      alignContent="stretch"
      alignItems="stretch"
      spacing={0}
      {...rest}
    >
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={0}
        sx={{
          zIndex: 1,
        }}
      >
        <AppBarGlobalComponent
          id="aglyn:besigner-appbar-global"
          aria-label="besigner application toolbar global"
        />
        <AppBarModifyComponent
          id="aglyn:besigner-appbar-modify"
          aria-label="besigner application modifier toolbar"
        />
      </Stack>

      <Stack
        direction="row"
        alignItems="stretch"
        flexGrow={1}
        spacing={0}
        sx={{
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <ToolboxLeftComponent id="aglyn:besigner-toolbox-left" aria-label="besigner toolbox left" />

        <ViewportRootComponent
          id="aglyn:besigner-viewport"
          aria-label="besigner viewport"
          direction="column"
          alignItems="center"
          spacing={0}
        />

        <ToolboxRightComponent
          id="aglyn:besigner-toolbox-right"
          aria-label="besigner toolbox right"
        />
      </Stack>

      {children}
    </Editor>
  )
})

EditorComponentRaw.displayName = 'EditorComponent'
EditorComponentRaw.defaultProps = {}

export const EditorComponent = EditorComponentRaw
export default EditorComponent
