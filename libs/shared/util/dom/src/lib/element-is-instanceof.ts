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


import { getElementNodeName } from './get-element-node-name'
import { getWindow } from './get-window'
import { getElementComputedStyle } from './get-element-computed-style'


export function isElement(node) {
  const OwnElement = getWindow(node)['Element']
  return node instanceof OwnElement || node instanceof Element
}

export function isHTMLElement(node) {
  const OwnElement = getWindow(node)['HTMLElement']
  return node instanceof OwnElement || node instanceof HTMLElement
}

export function isShadowRoot(node): node is ShadowRoot {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false
  }
  const OwnElement = getWindow(node)['ShadowRoot']
  return node instanceof OwnElement || node instanceof ShadowRoot
}

export function isTableElement(element: Element): boolean {
  return ['table', 'td', 'th'].indexOf(getElementNodeName(element)) >= 0
}

export function isScrollParent(element: HTMLElement): boolean {
  // Firefox wants us to check `-x` and `-y` variations as well
  const {overflow, overflowX, overflowY} = getElementComputedStyle(element)
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX)
}
