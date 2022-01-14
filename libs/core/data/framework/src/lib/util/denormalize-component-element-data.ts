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

import {_isStrT} from '@aglyn/shared-util-guards'
import {
  AglynElementDenormalized,
  AglynElementNormalized,
  AglynElementNormalizedMap,
  ElementId,
} from '../types/aglyn-elements.types'


const denormalizeData = (
  element: AglynElementNormalized,
  flatMap: AglynElementNormalizedMap = {},
  elemData: AglynElementDenormalized[] = [],
): AglynElementDenormalized => {
  const {elements, ...rest} = element

  return {
    ...rest,
    elements: (elements || []).map($id => (
      denormalizeData(flatMap[$id], flatMap, elemData)
    )),
  }
}

export function denormalizeComponentElementData(
  element: AglynElementNormalized,
  parentId: ElementId,
): AglynElementDenormalized[]
export function denormalizeComponentElementData(
  elements: AglynElementNormalizedMap,
  parentId: ElementId,
): AglynElementDenormalized[]
export function denormalizeComponentElementData(
  elements: AglynElementNormalized | AglynElementNormalizedMap,
  parentId: ElementId,
): AglynElementDenormalized[] {
  const elemData: AglynElementDenormalized[] = []
  const elems: AglynElementNormalizedMap = _isStrT(elements.$id)
    ? {[elements.$id]: {...elements}} as AglynElementNormalizedMap
    : {...elements} as AglynElementNormalizedMap

  elemData.push(
    ...(elems[parentId].elements || []).map(($id: any) =>
      denormalizeData(elems[$id], elems),
    ),
  )

  return elemData
}
export default denormalizeComponentElementData
