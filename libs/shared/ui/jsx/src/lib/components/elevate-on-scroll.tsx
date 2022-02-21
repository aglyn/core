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

import {_isFnT} from '@aglyn/shared-util-guards'
import {useScrollTrigger} from '@mui/material'
// eslint-disable-next-line no-restricted-imports
import type {UseScrollTriggerOptions} from '@mui/material/useScrollTrigger/useScrollTrigger'
import {cloneElement, type ReactElement} from 'react'

/* eslint-disable-next-line */
export interface ElevationOnScrollProps<P = any & {elevation: number}> {
  children: ReactElement<P>
  renderProps?: Partial<P> | ((elevated: boolean) => Partial<P>)
  scrollTrigger?: UseScrollTriggerOptions
}

export function ElevateOnScroll<P>(props: ElevationOnScrollProps<P>) {
  const {children, scrollTrigger, renderProps} = props
  const triggered = useScrollTrigger(scrollTrigger)
  const overrideProps = _isFnT(renderProps)
    ? renderProps(triggered)
    : renderProps

  return cloneElement(children, overrideProps)
}

ElevateOnScroll.displayName = 'ElevateOnScroll'
ElevateOnScroll.defaultProps = {
  renderProps: (elevated) => ({
    elevation: elevated ? 4 : 0,
  }),
  scrollTrigger: {
    disableHysteresis: true,
    threshold: 0,
  },
}

export default ElevateOnScroll
