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

import {type SxProps, type Theme} from '../../vendor/mui'


export function handlePassSxProps<T extends object = Theme>(
  ...passProps: SxProps<T>[]
): SxProps<T>

export function handlePassSxProps<T extends object = Theme>(
  sx: SxProps<T>,
  ...passProps: SxProps<T>[]
): SxProps<T> {
  return [
    ...(Array.isArray(sx) ? sx : [sx]),
    ...passProps.reduce<any[]>((prev, current) => (
      prev.concat(Array.isArray(current) ? current : [current])
    ), []),
  ]
}
export default handlePassSxProps
