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
  AglynComponentHierarchy,
  AglynModuleModelOptions,
  AglynModuleModelT,
  BundleUId,
  ComponentId,
  ContextDomain,
  ContextStore,
  ElementId,
  IAglynAppController,
  IAglynModuleModel,
} from '@aglyn/core-data-framework'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type {LogLevelString} from '@aglyn/shared-util-logger'
import type {BehaviorSubject} from 'rxjs'
import type {
  BesignerDeviceFlag,
  BesignerPanelTabFlag,
  BesignerPanelViewFlag,
  DndDragSourceTypeFlag,
  DndDropLinealTypeFlag,
  InteractionModeFlag,
} from '../constants/besigner'
import type {
  BesignerClosePanelPayload,
  BesignerGetStorePayload,
  BesignerOpenPanelPayload,
  BesignerSetCanvasHoveredPayload,
  BesignerSetCanvasSelectedPayload,
  BesignerSetDndPayload,
  BesignerSetFlagPayload,
  BesignerSetPanelsPayload,
} from '../constants/emitter'
import {
  BesignerSetCanvasItemPayload,
  BesignerSetCanvasPayload,
  BesignerSetDndItemPayload,
  BesignerSetFlagsPayload,
  BesignerSetPanelPayload,
  BesignerTogglePanelPayload,
} from '../constants/emitter'


export type BesignerContextStores = {
  flags: {
    debug: boolean
    logLevel: LogLevelString
    interactMode: InteractionModeFlag
    activeView?: BesignerPanelViewFlag
    devicePreview?: BesignerDeviceFlag
  }
  canvas: {
    selected?: {
      $id?: ElementId
      hierarchy?: ElementId[]
    }
    hovered?: {
      $id?: ElementId
      hierarchy?: ElementId[]
    }
  }
  panels: {
    panelLeft?: BesignerPanelItem
    panelRight?: BesignerPanelItem
    panelBottom?: BesignerPanelItem
  }
  dnd: {
    active?: BesignerDndElementBaseData<DndDragSourceTypeFlag>
    over?: BesignerDndElementBaseData<DndDropLinealTypeFlag>
  }
}
export type BesignerFlagsState = BesignerContextStores['flags']
export type BesignerFlagKey = keyof BesignerFlagsState
export type BesignerFlagValue<K extends BesignerFlagKey = BesignerFlagKey> = BesignerFlagsState[K]
export type BesignerCanvasState = BesignerContextStores['canvas']
export type BesignerCanvasItemKey = keyof BesignerCanvasState
export type BesignerCanvasItemValue<K extends BesignerCanvasItemKey = BesignerCanvasItemKey> = BesignerCanvasState[K]
export type BesignerCanvasSelectedElement = BesignerCanvasItemValue<'selected'>
export type BesignerCanvasHoveredElement = BesignerCanvasItemValue<'hovered'>
export type BesignerPanelsState = BesignerContextStores['panels']
export type BesignerPanelKey = keyof BesignerPanelsState
export type BesignerPanelValue<K extends BesignerPanelKey = BesignerPanelKey> = BesignerPanelsState[K]
export type BesignerDndState = BesignerContextStores['dnd']
export type BesignerDndItemKey = keyof BesignerDndState
export type BesignerDndItemValue<K extends BesignerDndItemKey = BesignerDndItemKey> = BesignerDndState[K]
export type BesignerDndElementActive = BesignerContextStores['dnd']['active']
export type BesignerDndElementOver = BesignerContextStores['dnd']['over']
export type BesignerPanelItem = {
  id?: BesignerPanelViewFlag
  size?: number | string
  toggled?: boolean
  tab?: BesignerPanelTabFlag
}
export type BesignerDndElementBaseData<T extends DndDragSourceTypeFlag | DndDropLinealTypeFlag> = {
  $id: ElementId
  type?: T
  componentId?: ComponentId
  bundleId?: BundleUId
  hierarchy?: AglynComponentHierarchy
}

export type BesignerNestedStores<K extends keyof BesignerContextStores = keyof BesignerContextStores> = {
  [P in K]: ContextStore<BesignerContextStores[P]>
}

export interface BesignerContext {
  _domain: ContextDomain
  _store: ContextStore<BesignerContextStores>
  stores: BesignerNestedStores
  events: any
}

export interface AglynBesignerControllerOptions extends AglynModuleModelOptions {
  defaults?: Partial<BesignerContextStores>
}

export interface IAglynBesignerController extends IAglynModuleModel<AglynBesignerControllerOptions> {
  readonly __store__: {
    canvas: BehaviorSubject<BesignerCanvasState>,
    dnd: BehaviorSubject<BesignerDndState>,
    flags: BehaviorSubject<BesignerFlagsState>,
    panels: BehaviorSubject<BesignerPanelsState>,
  }
  readonly _domain: ContextDomain
  readonly _store: ContextStore<BesignerContextStores>
  readonly canvas: BehaviorSubject<BesignerCanvasState>
  readonly dnd: BehaviorSubject<BesignerDndState>
  readonly events: any
  readonly flags: BehaviorSubject<BesignerFlagsState>
  readonly panels: BehaviorSubject<BesignerPanelsState>
  readonly stores: BesignerNestedStores

  getStore<K extends keyof BesignerContextStores>(payload: BesignerGetStorePayload<K>): ContextStore<BesignerContextStores[K]>

  closePanel(payload: BesignerClosePanelPayload): this
  openPanel(payload: BesignerOpenPanelPayload): this
  setCanvas(payload: BesignerSetCanvasPayload): this
  setCanvasHovered(payload: BesignerSetCanvasHoveredPayload): this
  setCanvasItem(payload: BesignerSetCanvasItemPayload): this
  setCanvasSelected(payload: BesignerSetCanvasSelectedPayload): this
  setDnd(payload: BesignerSetDndPayload): this
  setDndItem(payload: BesignerSetDndItemPayload): this
  setFlag(payload: BesignerSetFlagPayload): this
  setFlags(payload: BesignerSetFlagsPayload): this
  setPanel(payload: BesignerSetPanelPayload): this
  setPanels(payload: BesignerSetPanelsPayload): this
  togglePanel(payload: BesignerTogglePanelPayload): this
}

export interface AglynBesignerControllerT extends AglynModuleModelT<AglynBesignerControllerOptions> {
  new(app: IAglynAppController, options: AglynBesignerControllerOptions): IAglynBesignerController
}
