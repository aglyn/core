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
import {
  type ElementId,
  getCanvasDenormalizedElementsStore,
  getComponentElementHierarchy,
} from '@aglyn/core-data-framework'
import {useAglynAppContext} from '@aglyn/core-feature-renderer'
import type {Conditional} from '@aglyn/shared-data-types'
import {useEffect, useState} from 'react'


type ElementSelfStatus = {
  isSelfHovered: boolean
  isSelfSelected: boolean
}
type ElementSelfChildStatus = {
  isSelfHovered: boolean
  isSelfSelected: boolean
  isChildHovered?: boolean
  isChildSelected?: boolean
}

export type AglynCanvasElementStatus<T> =
  Conditional<T, true, ElementSelfChildStatus, ElementSelfStatus>

export function useAglynCanvasElementStatus<T extends boolean = false>(
  $id: ElementId,
  includeChildStatus: T = false as T,
): AglynCanvasElementStatus<T> {
  const app = useAglynAppContext() as IBesignerAppController
  const [value, setValue] = useState<AglynCanvasElementStatus<T>>(() => {
    const initialValue: ElementSelfChildStatus = {
      isSelfHovered: false,
      isSelfSelected: false,
    }
    if (includeChildStatus) {
      initialValue.isChildHovered = false
      initialValue.isChildSelected = false
    }
    return initialValue
  })

  useEffect(() => {
    const subscription = app.besigner?.__store__.canvas?.subscribe((canvas) => {
      const response: ElementSelfChildStatus = {
        isSelfHovered: Boolean($id && canvas.hovered?.$id === $id),
        isSelfSelected: Boolean($id && canvas.selected?.$id === $id),
      }
      if (includeChildStatus) {
        const elements = getCanvasDenormalizedElementsStore(app).getState()
        const selectedHierarchy = getComponentElementHierarchy(canvas?.selected?.$id, elements)
        const hoverHierarchy = getComponentElementHierarchy(canvas?.hovered?.$id, elements)
        response.isChildSelected = Boolean($id && checkHierarchy(selectedHierarchy, $id))
        response.isChildHovered = Boolean($id && checkHierarchy(hoverHierarchy, $id))
      }
      setValue(response)
    })

    return () => subscription.unsubscribe()
  }, [$id, app, includeChildStatus])

  return value

  function checkHierarchy(v: string[], $id: ElementId) {
    return (v || [])?.some((id, i, a) => id === $id && i !== a.length - 1)
  }
}

export default useAglynCanvasElementStatus
