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

import type {Icon as MdiIcon, IconId as MdiIconId} from '@aglyn/shared-data-mdi'
import {DEFAULT_ICON, MdiIcons} from '@aglyn/shared-data-mdi'
import {useEffect, useState} from 'react'


export type Icon = MdiIcon
export type IconId = MdiIconId

export const useMdiIcons = (iconIds?: IconId[]): Icon[] => {
  const [icons, setIcons] = useState(() => [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let mounted = true
      if (Array.isArray(iconIds)) {

        setIcons(() => {
          const icons = MdiIcons.filter(({id}) => iconIds.indexOf(id) >= 0)
          return iconIds.map((id) => {
            return icons.find((icon) => icon.id === id) || DEFAULT_ICON
          })
        })
        // getMdiIconFromId(iconIds).then((icons: MdiIcon[]) => {
        //   if (unloaded) return
        //   setIcons([...icons])
        // })
      }
      else if (!iconIds) {
        setIcons(MdiIcons)
      }
      return () => {mounted = false}
    }
  }, [iconIds, setIcons])

  return icons
}
export default useMdiIcons
