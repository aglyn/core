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

import type { Measurement } from '@aglyn/shared-data-enums'
import '@aglyn/shared-data-jsx'
import { alpha, darken } from '@aglyn/shared-ui-theme'
import { Box as MuiBox, type BoxProps, ButtonBase, styled } from '@mui/material'
import { forwardRef, useCallback } from 'react'
import type { Measurements } from '../types'

export { Measurements }

const BTN_SIZE = 20
const HEIGHT = 200

export interface BoxButtonStylerProps extends Omit<BoxProps, 'onChange'> {
  measurements?: Measurements
  size?: { width?: Measurement; height: Measurement }
  onChange?: (measurements?: Measurements) => void
}

const MarginButton = styled(ButtonBase)(({ theme }) => ({
  overflow: 'hidden',
  textAlign: 'center',
  bgcolor: 'secondary.light',
  cursor: 'pointer',
  backfaceVisibility: 'hidden',
  borderStyle: 'dashed',
  borderWidth: 1,
  borderColor: theme.palette.warning.dark,
  backfaceVisibility: 'hidden',
  backgroundColor: alpha(theme.palette.surface.main, 0.96),
  color: theme.palette.getContrastText(alpha(theme.palette.surface.main, 0.96)),
}))

const PaddingButton = styled(ButtonBase)(({ theme }) => ({
  overflow: 'hidden',
  borderStyle: 'dashed',
  borderWidth: 1,
  borderColor: theme.palette.success.dark,
  backfaceVisibility: 'hidden',
  backgroundColor: alpha(darken(theme.palette.surface.main, 0.12), 0.96),
  background: [
    'linear-gradient(',
    '65deg, ',
    `${alpha(theme.palette.tertiary.main, 0.12)}, `,
    `${alpha(theme.palette.secondary.main, 0.12)}`,
    ') content-box',
  ].join(''),
  color: theme.palette.getContrastText(
    alpha(darken(theme.palette.surface.main, 0.12), 0.96),
  ),
}))

export const BoxButtonStyler = forwardRef<any, BoxButtonStylerProps>(
  (props, ref) => {
    const { measurements, size, onChange, ...rest } = props
    const { width, height } = { ...size }

    const handleChange = useCallback(
      (key: keyof Measurements) => (dimension: Measurement) => {
        const res = { ...measurements, [key]: dimension }
        onChange && onChange(res)
      },
      [onChange, measurements],
    )

    return (
      <MuiBox
        ref={ref}
        width={1}
        height={HEIGHT}
        bgcolor="background.default"
        display="flex"
        flexDirection="column"
        position="relative"
        textAlign="center"
        {...rest}
      >
        <MarginButton
          sx={{
            width: 1,
            height: `${BTN_SIZE}%`,
            borderBottomWidth: 0,
            clipPath: `polygon(0% 0%, 100% 0%, ${
              100 - BTN_SIZE
            }% 100%, ${BTN_SIZE}% 100%)`,
          }}
        >
          mt
        </MarginButton>
        <MarginButton
          sx={{
            height: 1,
            top: 0,
            left: 0,
            borderRightWidth: 0,
            position: 'absolute',
            width: `${BTN_SIZE}%`,
            clipPath: `polygon(0% 0%, 100% ${BTN_SIZE}%, 100% ${
              100 - BTN_SIZE
            }%, 0% 100%)`,
          }}
        >
          ml
        </MarginButton>

        <MuiBox
          width={`calc(100% - ${BTN_SIZE * 2}%)`}
          height={`calc(100% - ${BTN_SIZE * 2}%)`}
          display="flex"
          flexDirection="column"
          margin="0 auto"
          position="relative"
          textAlign="center"
          overflow="hidden"
        >
          <PaddingButton
            sx={{
              width: 1,
              height: `calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`,
              clipPath: `polygon(0% 0%, 100% 0%, calc(${BTN_SIZE * 2}% + (${
                100 - BTN_SIZE
              }% * 0.3333334)) 100%, calc(${BTN_SIZE}% + (${
                BTN_SIZE * 2
              }% * 0.3333334)) 100%)`,
            }}
          >
            pt
          </PaddingButton>
          <PaddingButton
            sx={{
              height: 1,
              top: 0,
              left: 0,
              position: 'absolute',
              width: `calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`,
              clipPath: `polygon(0% 0%, 100% calc(${BTN_SIZE}% + (${
                BTN_SIZE * 2
              }% * 0.3333334)), 100% calc(${BTN_SIZE * 2}% + (${
                100 - BTN_SIZE
              }% * 0.3333334)), 0% 100%)`,
            }}
          >
            pl
          </PaddingButton>

          <MuiBox
            width={`calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`}
            height={`calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`}
            margin="0 auto"
            position="relative"
            textAlign="center"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            fontSize={12}
          >
            <div>Contents</div>
          </MuiBox>

          <PaddingButton
            sx={{
              height: 1,
              width: `calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`,
              clipPath: `polygon(0% calc(${BTN_SIZE}% + (${
                BTN_SIZE * 2
              }% * 0.3333334)), 100% 0%, 100% 100%, 0% calc(${
                BTN_SIZE * 2
              }% + (${100 - BTN_SIZE}% * 0.3333334)))`,
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            pr
          </PaddingButton>
          <PaddingButton
            sx={{
              width: 1,
              height: `calc(${BTN_SIZE}% + (${BTN_SIZE * 2}% * 0.3333334))`,
              clipPath: `polygon(calc(${BTN_SIZE}% + (${
                BTN_SIZE * 2
              }% * 0.3333334)) 0%, calc(${BTN_SIZE * 2}% + (${
                100 - BTN_SIZE
              }% * 0.3333334)) 0%, 100% 100%, 0% 100%)`,
            }}
          >
            pb
          </PaddingButton>
        </MuiBox>
        <MarginButton
          sx={{
            height: 1,
            top: 0,
            right: 0,
            borderLeftWidth: 0,
            position: 'absolute',
            width: `${BTN_SIZE}%`,
            clipPath: `polygon(0% ${BTN_SIZE}%, 100% 0%, 100% 100%, 0% ${
              100 - BTN_SIZE
            }%)`,
          }}
        >
          mr
        </MarginButton>
        <MarginButton
          sx={{
            width: 1,
            borderTopWidth: 0,
            height: `${BTN_SIZE}%`,
            clipPath: `polygon(${BTN_SIZE}% 0%, ${
              100 - BTN_SIZE
            }% 0%, 100% 100%, 0% 100%)`,
          }}
        >
          mb
        </MarginButton>
      </MuiBox>
    )
  },
)
BoxButtonStyler.displayName = 'BoxButtonStyler'

export default BoxButtonStyler
