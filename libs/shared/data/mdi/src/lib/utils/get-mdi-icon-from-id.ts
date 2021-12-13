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

import type {Icon, IconId} from '../../types/icon'
import {DEFAULT_ICON, handleIconNotFound} from './handle-icon-not-found'


type MdiIconFromId = Icon | undefined
type IconResponse<T> = T extends any
  ? T extends any[] ? MdiIconFromId[]
    : T extends string ? MdiIconFromId
      : never
  : never

export const getMdiIconFromId = async (
  iconId: IconId | IconId[],
): Promise<IconResponse<typeof iconId>> => {

  if (Array.isArray(iconId)) {
    const icons = []
    for (const id of iconId) {
      const icon = iconId && (await import(`../../generated/6.5.95/modules/mdi-${id}`)
        .then((mod) => mod.default)
        .catch((e) => {
          console.warn(`Icon not found with id(${id})`, e)
          return DEFAULT_ICON
        }))
      icons.push(handleIconNotFound(id, icon))

    }
    return icons
  }

  const icon = iconId && await import(`../../generated/6.5.95/modules/mdi-${iconId}`)
    .then((mod) => mod.default)
    .catch((e) => {
      console.warn(`Icon not found with id(${iconId})`, e)
      return DEFAULT_ICON
    })

  return handleIconNotFound(iconId, icon)
}
export default getMdiIconFromId
