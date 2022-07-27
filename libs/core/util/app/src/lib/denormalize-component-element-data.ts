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

import type {
  AglynNodeDenormalized,
  AglynNodeNormalized,
  AglynNodesDenormalized,
  AglynNodesNormalized,
  NodeId,
} from '@aglyn/core-data-foundation'
import {
  CANVAS_ROOT_ELEMENT_ID,
  DEFAULT_ROOT_ELEMENT,
} from '@aglyn/core-data-foundation'
import { arraySafe, copy } from '@aglyn/shared-util-tools'

const denormalizeData = (
  element: AglynNodeNormalized,
  parentId: NodeId,
  accumulator: AglynNodesDenormalized = {},
): AglynNodesDenormalized => {
  if (element?.$id && parentId && accumulator[parentId]) {
    const _element = element as unknown as AglynNodeDenormalized
    const childElements: AglynNodesNormalized = [...arraySafe(element.elements)]
    _element.parentId = parentId
    _element.elements = []
    accumulator[_element.$id] = _element
    ;(accumulator[parentId].elements ||= []).push(_element.$id)
    for (const child of childElements) {
      if (!child?.$id) continue
      denormalizeData(child, _element.$id, accumulator)
    }
  }
  return accumulator
}

export function denormalizeComponentElementData(
  element: AglynNodeNormalized,
  parentId: NodeId,
  accumulator?: AglynNodesDenormalized,
): AglynNodesDenormalized
export function denormalizeComponentElementData(
  elements: AglynNodesNormalized,
  parentId?: NodeId,
): AglynNodesDenormalized
export function denormalizeComponentElementData(
  data: AglynNodeNormalized | AglynNodesNormalized,
  parentId: NodeId = CANVAS_ROOT_ELEMENT_ID,
  accumulator?: AglynNodesDenormalized,
): AglynNodesDenormalized {
  let denormalized: AglynNodesDenormalized

  if (accumulator) denormalized = accumulator
  else if (parentId === CANVAS_ROOT_ELEMENT_ID) {
    denormalized = {
      [DEFAULT_ROOT_ELEMENT.$id]: {
        ...(copy(DEFAULT_ROOT_ELEMENT) as AglynNodeDenormalized),
      },
    }
  } else {
    denormalized = {
      [parentId]: {
        $id: parentId,
        elements: [],
        parentId: null,
        componentId: undefined,
      },
    }
  }

  if (!data) return denormalized
  const state = copy(data)

  try {
    for (const element of arraySafe(state, [state])) {
      denormalizeData(element, parentId, denormalized)
    }
  } catch (error) {
    console.error(error)
  }

  return denormalized
}
export default denormalizeComponentElementData
