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


import type {IBesignerAppController} from '@aglyn/core-data-besigner'
import type {ElementId} from '@aglyn/core-data-framework'
import {useAglynAppContext} from '@aglyn/core-feature-renderer'
import {useEffect, useState} from 'react'


export type AglynDndElementStatus = [
  isDragging: boolean,
  isDraggingOver: boolean
]

export function useAglynDndElementStatus($id: ElementId): AglynDndElementStatus {
  const app = useAglynAppContext() as IBesignerAppController
  const [value, setValue] = useState<AglynDndElementStatus>([false, false])
  useEffect(() => {
    const subscription = app.besigner?.__store__.dnd?.subscribe((dnd) => {
      setValue([
        Boolean($id && dnd.active?.$id === $id),
        Boolean($id && dnd.over?.$id === $id),
      ])
    })

    return () => subscription.unsubscribe()
  }, [$id, app])

  return value
}

export default useAglynDndElementStatus
