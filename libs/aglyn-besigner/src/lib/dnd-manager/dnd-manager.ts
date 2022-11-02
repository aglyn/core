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

export interface DndStatus {
  /**
   * The current drag object
   */
  drag?: Aglyn.NodeSchema | null
  /**
   * The current drop object
   */
  drop?: Aglyn.NodeSchema | null
  /**
   * Computed guard to check if dragging
   */
  readonly isDragging?: boolean
  /**
   * Computed guard to check if drop target available
   */
  readonly hasDropTarget?: boolean
  /**
   * Computed drop object breadcrumb path
   */
  readonly dragBreadcrumbs?: Aglyn.NodeBreadcrumbPath | false
  /**
   * Computed drop object breadcrumb path
   */
  readonly dropBreadcrumbs?: Aglyn.NodeBreadcrumbPath | false
  /**
   * Guard to check if provided node is dragging
   */
  isDraggingNode(node: Aglyn.NodeSchema<any>): boolean
}

export const dndStatus = observable<DndStatus>({
  drag: null,
  drop: null,
  get isDragging(): boolean {
    return Boolean(this.drag)
  },
  get hasDropTarget(): boolean {
    return Boolean(this.drop)
  },
  get dragBreadcrumbs(): Aglyn.NodeBreadcrumbPath | false {
    if (!this.isDragging) return false
    return Aglyn.screen.getNodeBreadcrumbPath(this.drag as Aglyn.NodeSchema)
  },
  get dropBreadcrumbs(): Aglyn.NodeBreadcrumbPath | false {
    if (!this.hasDropTarget) return false
    return Aglyn.screen.getNodeBreadcrumbPath(this.drop as Aglyn.NodeSchema)
  },
  isDraggingNode(node: Aglyn.NodeSchema<any>): boolean {
    return isDraggingNode(node)
  },
})

export enum InteractionModeFlag {
  SELECT = 0x1,
  REARRANGE = 0x2,
  PREVIEW = 0x3,
}

export enum BesignerPanelViewFlag {
  PANEL_LEFT = 0x1,
  PANEL_RIGHT = 0x2,
  PANEL_BOTTOM = 0x3,
}

export enum BesignerPanelTabFlag {
  ELEMENTS_TREE = 0x1,
  ELEMENT_BROWSE = 0x2,
  ELEMENT_INFO = 0x3,
  ELEMENT_PROPS_FORM = 0x4,
  ELEMENT_STYLES = 0x5,
}

export enum BesignerDeviceFlag {
  SCALE = 0x1,
  RESPONSIVE = 0x2,
  XS = 0x3,
  SM = 0x4,
  MD = 0x5,
  LG = 0x6,
  XL = 0x7,
}

export enum DragType {
  CANVAS = 'canvas',
  TEMPLATE = 'template',
  TREE = 'tree',
}

export enum DndDropType {
  BEFORE = 0x1,
  INSIDE = 0x2,
  AFTER = 0x3,
}

export function clearDndStatus() {
  runInAction(() => {
    dndStatus.drag = null
    dndStatus.drop = null
  })
}

export function setDragNode(dragNode: Aglyn.NodeSchema<any> | null) {
  runInAction(() => {
    dndStatus.drag = dragNode
  })
}

export function setDropNode(dropNode: Aglyn.NodeSchema<any> | null) {
  runInAction(() => {
    dndStatus.drop = dropNode
  })
}

export function isDraggingNode(node: Aglyn.NodeSchema<any>): boolean {
  if (!node) return false
  return node?.$id === dndStatus.drag?.$id
}

export function isDraggingDropNode(node: Aglyn.NodeSchema<any>): boolean {
  if (!node) return false
  return node?.$id === dndStatus.drop?.$id
}

export function isDraggingOverDropNode(node: Aglyn.NodeSchema<any>): boolean {
  if (!node) return false
  const breadcrumbs = dndStatus.dropBreadcrumbs
  return Array.isArray(breadcrumbs) && breadcrumbs.indexOf(node?.$id) >= 0
}
