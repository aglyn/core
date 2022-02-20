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

import type {AnyObj, Dictionary, EmptyObj, OrUndef} from '@aglyn/shared-data-types'
import type {SxProps, Theme} from '../../vendor/mui'


export type PassSxProps<Theme extends AnyObj = EmptyObj> =
  OrUndef<SxProps<Theme>>
export type MergedPassSxProps<T extends Dictionary<any> = Theme> =
  Extract<PassSxProps<T>, any[]>

export function handlePassSxProps<T extends Dictionary<any> = Theme>(
  sx: PassSxProps<T>,
  ...passProps: Array<PassSxProps<T>>
): MergedPassSxProps<T>

export function handlePassSxProps<T extends Dictionary<any> = Theme>(
  ...sx: Array<PassSxProps<T>>
): MergedPassSxProps<T> {
  const res: Extract<PassSxProps<T>, any[]> = []

  for (const i of sx) {
    if (!i) continue
    if (Array.isArray(i)) res.push(...handlePassSxProps(i))
    else res.push(i)
  }

  return res
}
export default handlePassSxProps
