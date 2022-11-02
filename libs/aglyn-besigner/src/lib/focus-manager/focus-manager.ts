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

import * as Aglyn from '@aglyn/aglyn'
import { observable, runInAction } from 'mobx'

export interface FocusStatus {
  /**
   * The current hovered node
   */
  hovered?: Aglyn.NodeSchema<any> | null
  /**
   * The current selected node
   */
  selected: Aglyn.NodeSchema<any>[]
  /**
   * The current expanded node in tree views
   */
  expanded: Aglyn.NodeSchema<any>[]
  /**
   * The computed last selected node
   */
  readonly lastSelected?: Aglyn.NodeSchema<any> | undefined
}

export const focusStatus = observable<FocusStatus>({
  hovered: null,
  selected: [],
  expanded: [],

  get lastSelected(): Aglyn.NodeSchema<any> | undefined {
    return this.selected[this.selected.length - 1]
  },
})

export function isNodeSelected(node: Aglyn.NodeSchema<any>) {
  if (!node) return false
  return focusStatus.selected.some((i) => i?.$id === node?.$id)
}

export function isNodeHovered(node: Aglyn.NodeSchema<any>) {
  if (!node) return false
  return focusStatus.hovered?.$id === node?.$id
}

export function isNodeExpanded(node: Aglyn.NodeSchema<any>) {
  if (!node) return false
  return focusStatus.expanded.some((i) => i?.$id === node?.$id)
}

export function clearFocusStatus() {
  runInAction(() => {
    focusStatus.selected = []
    focusStatus.hovered = null
  })
}

export function clearSelection() {
  runInAction(() => {
    focusStatus.selected = []
  })
}

export function clearHover() {
  runInAction(() => {
    focusStatus.hovered = null
  })
}

export function handleNodeSelection(
  node: Aglyn.NodeSchema<any>,
  multiSelection = false,
) {
  if (isNodeSelected(node)) {
    deselectNode(node, multiSelection)
  } else {
    setSelectedNode(node, multiSelection)
  }
}

export function deselectNode(
  node: Aglyn.NodeSchema<any>,
  multiSelection = false,
) {
  if (!isNodeSelected(node)) return
  runInAction(() => {
    if (multiSelection) {
      const selectIndex = focusStatus.selected.indexOf(node)
      focusStatus.selected.splice(selectIndex, 1)
    } else {
      focusStatus.selected = []
    }
  })
}

export function setSelectedNode(
  node: Aglyn.NodeSchema<any>,
  multiSelection = false,
) {
  if (isNodeSelected(node)) return
  runInAction(() => {
    if (multiSelection) focusStatus.selected.push(node)
    else focusStatus.selected = [node]
  })
}

export function setHoveredNode(node: Aglyn.NodeSchema<any>) {
  if (isNodeHovered(node)) return
  runInAction(() => {
    focusStatus.hovered = node
  })
}

export function dehoverNode(node: Aglyn.NodeSchema<any>) {
  if (!isNodeHovered(node)) return
  runInAction(() => {
    focusStatus.hovered = null
  })
}
