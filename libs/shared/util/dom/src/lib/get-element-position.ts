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

export interface ClientPosition {
  readonly offsetLeft: HTMLElement['offsetLeft']
  readonly offsetTop: HTMLElement['offsetTop']
  readonly width: DOMRect['width']
  readonly height: DOMRect['height']
  readonly left: DOMRect['left']
  readonly top: DOMRect['top']
  readonly x: DOMRect['x']
  readonly y: DOMRect['y']
}

export function getElementPosition(element: HTMLElement): ClientPosition {
  const node = element

  const rect = node?.getBoundingClientRect(),
    width = rect?.width,
    height = rect?.height,
    left = rect?.left,
    top = rect?.top,
    x = rect?.x,
    y = rect?.y,
    offsetLeft = node?.offsetLeft,
    offsetTop = node?.offsetTop

  return {width, height, left, top, x, y, offsetLeft, offsetTop}
}
