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

import { Image } from '@aglyn/shared-ui-next'
import { useThemeModeState } from '@aglyn/shared-ui-theme'
import {
  Paper,
  Stack,
  type StackProps,
  Typography,
  type TypographyProps,
} from '@mui/material'
import { forwardRef, useMemo } from 'react'
import aglynIcon from '../public/_static/images/brand/aglyn-logo-full-light.svg'
import aglynIconDark from '../public/_static/images/brand/aglyn-logo-full-light.svg'
import aglynLogo from '../public/_static/images/brand/aglyn-logo-full-light.svg'
import aglynLogoDark from '../public/_static/images/brand/aglyn-logo-full-light.svg'

export interface AuthFormProps extends StackProps {
  paperTop?: JSX.Node
  headingTop?: JSX.Node
  headingTopProps?: TypographyProps<any, any>
  headingBottom?: JSX.Node
  headingBottomProps?: TypographyProps<any, any>
  headingAfter?: JSX.Node
  paperAfter?: JSX.Node
}

const AuthFormComponent = forwardRef<any, AuthFormProps>((props, ref) => {
  const {
    paperTop,
    headingTop,
    headingTopProps,
    headingBottom,
    headingBottomProps,
    headingAfter,
    paperAfter,
    children,
    ...rest
  } = props
  const [[, themeMode]] = useThemeModeState()
  const [aglynLogoUrl, aglynIconUrl] = useMemo(() => {
    if (themeMode === 'dark') {
      return [aglynLogo, aglynIcon]
    }
    return [aglynLogoDark, aglynIconDark]
  }, [themeMode])

  return (
    <Stack
      ref={ref}
      direction="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      spacing={2}
      maxWidth={1}
      width={420}
      {...rest}
    >
      <Paper variant="outlined" sx={{ p: 2, width: 420, maxWidth: 1 }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          marginBottom={4}
        >
          {paperTop}

          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
            sx={{ pb: 3 }}
          >
            <Image
              alt={'aglyn'}
              src={aglynLogoUrl}
              sx={{
                height: '32px',
                width: '99px',
              }}
              height={32}
              width={99}
            />
          </Stack>

          {headingTop && (
            <Typography component="h1" variant="h4" {...headingTopProps}>
              {headingTop}
            </Typography>
          )}
          {headingBottom && (
            <Typography
              component="div"
              variant="h6"
              align="center"
              {...headingBottomProps}
            >
              {headingBottom}
            </Typography>
          )}
          {headingAfter}
        </Stack>

        {children}
      </Paper>

      {paperAfter}
    </Stack>
  )
})
AuthFormComponent.displayName = 'AuthFormComponent'
AuthFormComponent.aglyn = true

export default AuthFormComponent
