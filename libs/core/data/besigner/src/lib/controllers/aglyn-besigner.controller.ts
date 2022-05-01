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

import {
  type AglynModuleEffectListener,
  AglynModuleModel,
  type ContextDomain,
  type ContextStore,
  type IAglynAppController,
} from '@aglyn/core-data-framework'
import {copy} from '@aglyn/shared-util-tools'
import {objectDeepMerge} from '@aglyn/shared-util-vendor'
import {createApi} from 'effector'
import {BehaviorSubject} from 'rxjs'
// import {persist} from 'effector-storage/local'
import {BesignerDeviceFlag, BesignerPanelViewFlag, InteractionModeFlag} from '../constants/besigner'
import type {
  BesignerClosePanelPayload,
  BesignerGetStorePayload,
  BesignerOpenPanelPayload,
  BesignerSetCanvasHoveredPayload,
  BesignerSetCanvasItemPayload,
  BesignerSetCanvasPayload,
  BesignerSetCanvasSelectedPayload,
  BesignerSetDndItemPayload,
  BesignerSetDndPayload,
  BesignerSetFlagPayload,
  BesignerSetFlagsPayload,
  BesignerSetPanelPayload,
  BesignerSetPanelsPayload,
  BesignerTogglePanelPayload,
} from '../constants/emitter'
import type {
  AglynBesignerControllerOptions,
  BesignerCanvasState,
  BesignerContext,
  BesignerContextStores,
  BesignerDndState,
  BesignerFlagsState,
  BesignerNestedStores,
  BesignerPanelsState,
  IAglynBesignerController,
} from './aglyn-besigner.types'


const TAG = 'AglynBesigner'
const NS = 'aglyn.core.data.besigner.module.besigner'

export class AglynBesignerController extends AglynModuleModel<AglynBesignerControllerOptions> implements IAglynBesignerController {

  public static readonly [Symbol.toStringTag]: string = TAG
  public static readonly namespace: string = NS

  public readonly __store__: {
    canvas: BehaviorSubject<BesignerCanvasState>,
    dnd: BehaviorSubject<BesignerDndState>,
    flags: BehaviorSubject<BesignerFlagsState>,
    panels: BehaviorSubject<BesignerPanelsState>,
  }

  #context: BesignerContext = {
    _domain: null,
    _store: null,
    events: null,
    stores: null,
  }

  public get _domain(): ContextDomain {return this.#context._domain}
  public get _store(): ContextStore<BesignerContextStores> {return this.#context._store}
  public get stores(): BesignerNestedStores {return this.#context.stores}
  public get events(): any {return this.#context.events}
  public get flags(): BehaviorSubject<BesignerFlagsState> {return this.__store__.flags}
  public get canvas(): BehaviorSubject<BesignerCanvasState> {return this.__store__.canvas}
  public get panels(): BehaviorSubject<BesignerPanelsState> {return this.__store__.panels}
  public get dnd(): BehaviorSubject<BesignerDndState> {return this.__store__.dnd}

  protected get listeners(): AglynModuleEffectListener<any>[] {
    return []
  }

  constructor(app: IAglynAppController, options: AglynBesignerControllerOptions) {
    super(app, options)
    const optionsDefaults = copy(options.defaults || {})
    const state = objectDeepMerge({
      flags: {
        debug: true,
        logLevel: 'info',
        interactMode: InteractionModeFlag.SELECT,
        devicePreview: BesignerDeviceFlag.RESPONSIVE,
      },
      panels: {
        panelLeft: {
          id: BesignerPanelViewFlag.PANEL_LEFT,
          size: 290,
          toggled: false,
        },
        panelRight: {
          id: BesignerPanelViewFlag.PANEL_RIGHT,
          size: 375,
          toggled: false,
        },
        panelBottom: {
          id: BesignerPanelViewFlag.PANEL_BOTTOM,
          toggled: false,
        },
      },
      canvas: {
        hovered: {},
        selected: {},
      },
      dnd: {
        active: null,
        over: null,
      },
    }, optionsDefaults)
    console.log('state', state)

    this.__store__ = {
      canvas: new BehaviorSubject(state.canvas),
      // .pipe(throttleTime(20, undefined, {leading: false, trailing: true})),
      dnd: new BehaviorSubject(state.dnd),
      flags: new BehaviorSubject(state.flags),
      panels: new BehaviorSubject(state.panels),
    }
    this.#setup()
  }
  #setup() {
    this.#context._domain = this.app.contexts.domain.domain(this.namespace)

    const state = this.__store__

    const initialState = {
      flags: state.flags.getValue(),
      panels: state.panels.getValue(),
      canvas: state.canvas.getValue(),
      dnd: state.dnd.getValue(),
    }

    this.#context._store = this.#context._domain.createStore<BesignerContextStores>(
      initialState,
      {name: `${this.namespace}:store`},
    )
    // persist({store: this.#context._store})

    this.#context.stores = {
      flags: this.#context._store.map((state) => state.flags),
      canvas: this.#context._store.map((state) => state.canvas),
      panels: this.#context._store.map((state) => state.panels),
      dnd: this.#context._store.map((state) => state.dnd),
    }

    this.#context.events = createApi(this.#context._store, {

      setFlag: (store, payload: BesignerSetFlagPayload) => {
        const {flag, value} = payload || {}
        const prev = this.__store__.flags.getValue()
        const now = {...prev, [flag]: value(prev?.[flag], prev)}
        this.__store__.flags.next(now)
        return {...store, flags: now}
      },

      setFlags: (store, payload: BesignerSetFlagsPayload) => {
        const {flags} = payload || {}
        const prev = this.__store__.flags.getValue()
        const now = flags(prev)
        this.__store__.flags.next(now)
        return {...store, flags: now}
      },

      setPanel: (store, payload: BesignerSetPanelPayload) => {
        const {panel, value} = payload || {}
        const prev = this.__store__.panels.getValue()
        const now = {...prev, [panel]: value(prev?.[panel], prev)}
        this.__store__.panels.next(now)
        return {...store, panels: now}
      },

      setPanels: (store, payload: BesignerSetPanelsPayload) => {
        const {panels} = payload || {}
        const prev = this.__store__.panels.getValue()
        const now = panels(prev)
        this.__store__.panels.next(now)
        return {...store, panels: now}
      },

      togglePanel: (store, payload: BesignerTogglePanelPayload) => {
        const {panel} = payload || {}
        const prev = this.__store__.panels.getValue()
        const now = {
          ...prev, [panel]: {
            ...prev?.[panel], toggled: !prev?.[panel]?.toggled,
          },
        }
        this.__store__.panels.next(now)
        return {...store, panels: now}
      },

      openPanel: (store, payload: BesignerOpenPanelPayload) => {
        const {panel} = payload || {}
        const prev = this.__store__.panels.getValue()
        const now = {...prev, [panel]: {...prev?.[panel], toggled: true}}
        this.__store__.panels.next(now)
        return {...store, panels: now}
      },

      closePanel: (store, payload: BesignerOpenPanelPayload) => {
        const {panel} = payload || {}
        const prev = this.__store__.panels.getValue()
        const now = {...prev, [panel]: {...prev?.[panel], toggled: false}}
        this.__store__.panels.next(now)
        return {...store, panels: now}
      },

      setDndItem: (store, payload: BesignerSetDndItemPayload) => {
        const {item, value} = payload || {}
        const prev = this.__store__.dnd.getValue()
        const now = {...prev, [item]: value(prev?.[item], prev)}
        this.__store__.dnd.next(now)
        return {...store, dnd: now}
      },

      setDnd: (store, payload: BesignerSetDndPayload) => {
        const {dnd} = payload || {}
        const prev = this.__store__.dnd.getValue()
        const now = dnd(prev)
        this.__store__.dnd.next(prev)
        return {...store, dnd: now}
      },

      setCanvasItem: (store, payload: BesignerSetCanvasItemPayload) => {
        const {item, value} = payload || {}
        const prev = this.__store__.canvas.getValue()
        const now = {...prev, [item]: value(prev?.[item], prev)}
        this.__store__.canvas.next(now)
        return {...store, canvas: now}
      },

      setCanvas: (store, payload: BesignerSetCanvasPayload) => {
        const {canvas} = payload || {}
        const prev = this.__store__.canvas.getValue()
        const now = canvas(prev)
        this.__store__.canvas.next(now)
        return {...store, canvas: now}
      },

      setCanvasSelected: (store, payload: BesignerSetCanvasSelectedPayload) => {
        const {selected} = payload || {}
        const prev = this.__store__.canvas.getValue()
        const now = {...prev, selected: selected(prev?.selected, prev)}
        this.__store__.canvas.next(now)
        return {...store, canvas: now}
      },

      setCanvasHovered: (store, payload: BesignerSetCanvasHoveredPayload) => {
        const {hovered} = payload || {}
        const prev = this.__store__.canvas.getValue()
        const now = {...prev, hovered: hovered(prev?.hovered, prev)}
        this.__store__.canvas.next(now)
        return {...store, canvas: now}
      },

    })
  }

  public toJSON() {
    return {
      ...super.toJSON(),
    }
  }


  public getStore<K extends keyof BesignerContextStores>(
    payload: BesignerGetStorePayload<K>,
  ): ContextStore<BesignerContextStores[K]> {
    const {store} = payload
    return this.#context.stores[store]
  }


  public setFlag(payload: BesignerSetFlagPayload): this {
    this.#context.events.setFlag(payload)
    return this
  }
  public setFlags(payload: BesignerSetFlagsPayload): this {
    this.#context.events.setFlags(payload)
    return this
  }
  public setPanel(payload: BesignerSetPanelPayload): this {
    this.#context.events.setPanel(payload)
    return this
  }
  public setPanels(payload: BesignerSetPanelsPayload): this {
    this.#context.events.setPanels(payload)
    return this
  }
  public togglePanel(payload: BesignerTogglePanelPayload): this {
    this.#context.events.togglePanel(payload)
    return this
  }
  public openPanel(payload: BesignerOpenPanelPayload): this {
    this.#context.events.openPanel(payload)
    return this
  }
  public closePanel(payload: BesignerClosePanelPayload): this {
    this.#context.events.closePanel(payload)
    return this
  }
  public setDndItem(payload: BesignerSetDndItemPayload): this {
    this.#context.events.setDndItem(payload)
    return this
  }
  public setDnd(payload: BesignerSetDndPayload): this {
    this.#context.events.setDnd(payload)
    return this
  }
  public setCanvasItem(payload: BesignerSetCanvasItemPayload): this {
    this.#context.events.setCanvasItem(payload)
    return this
  }
  public setCanvas(payload: BesignerSetCanvasPayload): this {
    this.#context.events.setCanvas(payload)
    return this
  }
  public setCanvasSelected(payload: BesignerSetCanvasSelectedPayload): this {
    this.#context.events.setCanvasSelected(payload)
    return this
  }
  public setCanvasHovered(payload: BesignerSetCanvasHoveredPayload): this {
    this.#context.events.setCanvasHovered(payload)
    return this
  }
}

export default AglynBesignerController
