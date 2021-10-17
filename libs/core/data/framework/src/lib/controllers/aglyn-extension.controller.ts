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

import { MutableShallow } from '@aglyn/shared-data-types'
import { _isEqualitySameType } from '@aglyn/shared-util-guards'
import { getStaticField } from '@aglyn/shared-util-tools'
import {
  AglynAppEffectFlag,
  AglynAppEventFlag,
  AglynModuleActionPayload,
} from '../constants/emitter'
import { EXTENSION_TYPE, MODULE_TYPE } from '../constants/symbol'
import type { AglynAppController } from '../controllers/aglyn-app.controller'
import { AglynBaseModel } from '../models/aglyn-base.model'
import type { AglynExtension } from '../models/aglyn-extension.model'
import { AglynExtensionT } from '../models/aglyn-extension.model'
import { AglynExtensionMap, AglynLifecycleFlag, AglynTypeFields } from '../types'
import { isAglynExtension } from '../util/aglyn-is'
import { ExtensionUUN } from './aglyn-components.controller'


const TAG = 'AglynExtensionController'

export type AglynExtensionTypeFields = AglynTypeFields<typeof MODULE_TYPE, typeof EXTENSION_TYPE>
export type AglynExtensionLoader = () => Promise<AglynExtensionT>

export interface AglynExtensionController extends AglynBaseModel {
  registerExtension(data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_REGISTER]): void
  loadExtension(data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_LOAD]): void
  unloadExtension(data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_UNLOAD]): void
  destroyExtension(data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_DESTROY]): void
  getExtensionByName(name: string): AglynExtension
  getAllExtensions(): AglynExtension[]
  unloadAllExtensions(): void
}


export class AglynExtensionController extends AglynBaseModel {

  public static readonly [Symbol.toStringTag]: string = TAG

  protected app: AglynAppController
  protected extensions: AglynExtensionMap = new Map()

  public get [Symbol.toStringTag](): string {
    return getStaticField(Symbol.toStringTag, this)
  }

  constructor(props: { app: AglynAppController }) {
    super()
    const {app} = props
    this.app = app
    this.#setup()
  }
  #setup() {
    this.setErrorFactory(this.app.getErrorFactory())
    this.setEmitter(this.app.getEmitter())
    this.setLogger(this.app.getLogger())
  }

  public toString = (): string => {
    return `${TAG}(appName: '${this.app.getName()}')`
  }
  public toJSON = () => {
    return {
      ...super.toJSON(),
      extensions: this.extensions.keys(),
    }
  }

  public aglynOnInit = (): void => {
    this.listeners.forEach(([flag, method]) => this.app.getEmitter().on(flag, method))
  }
  public aglynOnDestroy = (): void => {
    this.listeners.forEach(([flag, method]) => this.app.getEmitter().off(flag, method))
  }

  public getExtensionByName = (extensionName: ExtensionUUN): AglynExtension => {
    const extension = this.extensions.get(extensionName)
    if (extension) {
      const current = extension?.lifecycle
      const autoload = extension?.getOptions?.()?.autoload
      if (current === AglynLifecycleFlag.INITIALIZED && autoload) {
        this.loadExtension({extensionName})
      }
    }
    else {
      // TODO: throw errorFactory error
    }
    return extension
  }
  public getAllExtensions = (): AglynExtension[] => {
    return [...this.extensions.values()]
  }
  public registerExtension = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_REGISTER],
  ): void => {
    const {extension} = data
    if (isAglynExtension(extension) && extension.extensionName) {
      const extensionName = extension.extensionName
      this.extensions.set(extensionName, extension as AglynExtension)
      extension.lifecycle = AglynLifecycleFlag.REGISTERED
      this.getLogger().debug(AglynAppEventFlag.REGISTERED_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.REGISTERED_EXTENSION, {extensionName})
      extension.aglynOnInit?.(this.app)
      extension.lifecycle = AglynLifecycleFlag.INITIALIZED
      this.getLogger().debug(AglynAppEventFlag.INITIALIZED_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.INITIALIZED_EXTENSION, {extensionName})
    }
    else {
      // TODO: throw errorFactory error
    }
  }
  public destroyExtension = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_DESTROY],
  ): void => {
    const {extensionName} = data
    const extension = this.extensions.get(extensionName)
    if (extension) {
      const isLoaded = _isEqualitySameType(
        extension.lifecycle,
        AglynLifecycleFlag.INITIALIZED,
        AglynLifecycleFlag.LOADING,
        AglynLifecycleFlag.LOADED,
      )
      if (isLoaded) {
        this.unloadExtension({extensionName})
      }
      this.getLogger().debug(AglynAppEventFlag.DESTROYING_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.DESTROYING_EXTENSION, {extensionName})
      extension.aglynOnDestroy?.(this.app)
      extension.lifecycle = AglynLifecycleFlag.DESTROYED
      this.extensions.delete(extensionName)
      this.getLogger().debug(AglynAppEventFlag.DESTROYED_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.DESTROYED_EXTENSION, {extensionName})
    }
    else {
      // TODO: throw errorFactory error
    }
  }
  public loadExtension = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_LOAD],
  ): void => {
    const {extensionName} = data
    const extension = this.extensions.get(extensionName) as MutableShallow<AglynExtension>
    const lifecycle = extension.lifecycle
    if (
      extension && (
        lifecycle === AglynLifecycleFlag.INITIALIZED
        || lifecycle === AglynLifecycleFlag.UNLOADED
      )
    ) {
      extension.lifecycle = AglynLifecycleFlag.LOADING
      this.getLogger().debug(AglynAppEventFlag.LOADING_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.LOADING_EXTENSION, {extensionName})
      extension.aglynOnLoad?.(this.app)
      extension.lifecycle = AglynLifecycleFlag.LOADED
      this.getLogger().debug(AglynAppEventFlag.LOADED_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.LOADED_EXTENSION, {extensionName})
    }
    else {
      // TODO: throw errorFactory error
    }
  }
  public unloadExtension = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.EXTENSION_UNLOAD],
  ): void => {
    const {extensionName} = data
    const extension = this.extensions.get(extensionName) as MutableShallow<AglynExtension>
    if (extension) {
      this.getLogger().debug(AglynAppEventFlag.UNLOADING_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.UNLOADING_EXTENSION, {extensionName})
      extension.aglynOnUnload?.(this.app)
      extension.lifecycle = AglynLifecycleFlag.UNLOADED
      this.getLogger().debug(AglynAppEventFlag.UNLOADED_EXTENSION, {extensionName})
      this.getEmitter().emit(AglynAppEventFlag.UNLOADED_EXTENSION, {extensionName})
    }
    else {
      // TODO: throw errorFactory error
    }
  }
  public unloadAllExtensions = (): void => {
    this.extensions.forEach((_, extensionName) => {
      this.unloadExtension({extensionName})
    })
  }


  private listeners: [AglynAppEffectFlag, (...args: any[]) => unknown][] = [
    [AglynAppEffectFlag.EXTENSION_REGISTER, this.registerExtension],
    [AglynAppEffectFlag.EXTENSION_DESTROY, this.destroyExtension],
    [AglynAppEffectFlag.EXTENSION_LOAD, this.loadExtension],
    [AglynAppEffectFlag.EXTENSION_UNLOAD, this.unloadExtension],
  ]
}
