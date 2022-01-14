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

import {_isArr} from '@aglyn/shared-util-guards'
import {
  AglynElementDenormalized,
  AglynElementNormalizedMap,
  ElementId,
} from '../types/aglyn-elements.types'


const normalizeData = (
  element: AglynElementDenormalized,
  parentId: ElementId,
  flatMap: AglynElementNormalizedMap = {},
): AglynElementNormalizedMap => {
  const {elements, ...rest} = element
  flatMap[rest.$id] = {...rest, parentId, elements: []}
  flatMap[parentId] = {
    ...flatMap[parentId],
    elements: (flatMap[parentId]?.elements || []).concat(rest.$id),
  }
  elements?.forEach((child) => {
    normalizeData(child, rest.$id, flatMap)
  })
  return flatMap
}

export function normalizeComponentElementData(
  element: AglynElementDenormalized,
  parentId?: ElementId,
): AglynElementNormalizedMap
export function normalizeComponentElementData(
  elements: AglynElementDenormalized[],
  parentId?: ElementId,
): AglynElementNormalizedMap
export function normalizeComponentElementData(
  elements: AglynElementDenormalized | AglynElementDenormalized[],
  parentId?: ElementId,
): AglynElementNormalizedMap {
  let elemData

  (_isArr(elements) ? elements : [elements]).forEach((element) => {
    elemData = normalizeData(element, parentId, elemData)
  })

  return elemData
}
export default normalizeComponentElementData
