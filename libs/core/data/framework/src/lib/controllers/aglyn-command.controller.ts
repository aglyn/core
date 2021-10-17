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

import { Dictionary } from '@aglyn/shared-data-types'
import { _isFnT } from '@aglyn/shared-util-guards'
import { Mitt } from '@aglyn/shared-util-vendor'
import { Emitter } from 'mitt'
import {
  AglynAppEffectFlag,
  AglynAppEventFlag,
  AglynModuleActionPayload,
} from '../constants/emitter'
import { COMMAND_LISTENER_TYPE, COMMAND_RESOLVER_TYPE, MODULE_TYPE } from '../constants/symbol'
import type { AglynAppController } from '../controllers/aglyn-app.controller'
import { AglynBaseModel } from '../models/aglyn-base.model'
import { AglynTypeFields, PayloadData } from '../types'
import { CommandUId } from './aglyn-components.controller'


const TAG = 'AglynCommandController'

export type AglynCommandResolverTypeFields = AglynTypeFields<typeof MODULE_TYPE, typeof COMMAND_RESOLVER_TYPE>
export type AglynCommandListenerTypeFields = AglynTypeFields<typeof MODULE_TYPE, typeof COMMAND_LISTENER_TYPE>

export type AglynCommander = Emitter<AglynCommandParams>

export enum AglynCommandFlag {
  ANY = '*',
}

export type AglynCommandParams = {
  [P in CommandUId | '*' | keyof AglynCommandFlag]: PayloadData<Dictionary>
}

export interface AglynCommandResolver extends AglynCommandResolverTypeFields {
  commandId: CommandUId
  (data: Dictionary): any
}

export interface AglynCommandListener extends AglynCommandListenerTypeFields {
  commandId: CommandUId
  (data: { request: Dictionary, response: Dictionary }): void
}

export interface AglynCommandController extends AglynBaseModel {
  setResolver(data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_REGISTER_RESOLVER]): void
  onResolve(data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_REGISTER_LISTENER]): void
  trigger(data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_TRIGGER]): void
  unregisterListener(data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_LISTENER]): void
  unregisterResolver(data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_RESOLVER]): void
}

export class AglynCommandController extends AglynBaseModel {

  public static readonly [Symbol.toStringTag]: string = TAG

  protected app: AglynAppController
  #commander: AglynCommander = Mitt()
  #resolvers: Map<CommandUId, AglynCommandResolver> = new Map()

  public get commander(): AglynCommander {
    return this.#commander
  }
  public get resolvers(): Map<CommandUId, AglynCommandResolver> {
    return this.#resolvers
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

  public aglynOnInit = (): void => {
    this.listeners.forEach(([flag, method]) => this.app.getEmitter().on(flag, method))
  }
  public aglynOnDestroy = (): void => {
    this.listeners.forEach(([flag, method]) => this.app.getEmitter().off(flag, method))
  }

  public toString = (): string => {
    return `${TAG}(app: '${this.app.getName()}')`
  }
  public toJSON = () => {
    return {
      ...super.toJSON(),
      commands: [...this.#commander.all.values()],
    }
  }

  public setResolver = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_REGISTER_RESOLVER],
  ): void => {
    const {resolver} = data
    const commandId = resolver?.commandId
    this.#resolvers[commandId] = resolver
    this.getLogger().debug(AglynAppEventFlag.REGISTERED_COMMAND_RESOLVER, {commandId})
    this.getEmitter().emit(AglynAppEventFlag.REGISTERED_COMMAND_RESOLVER, {commandId})
  }
  public onResolve = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_REGISTER_LISTENER],
  ): void => {
    const {listener} = data
    const commandId = listener?.commandId
    this.#commander.on(commandId, listener)
    this.getLogger().debug(AglynAppEventFlag.REGISTERED_COMMAND_LISTENER, {commandId})
    this.getEmitter().emit(AglynAppEventFlag.REGISTERED_COMMAND_LISTENER, {commandId})
  }
  public trigger = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_TRIGGER],
  ): void => {
    const {commandId} = data
    const resolver = this.#resolvers[commandId]
    if (_isFnT(resolver)) {
      const resolved = resolver.call(undefined, data)
      this.getLogger().debug(AglynAppEventFlag.TRIGGERED_COMMAND_RESOLVER, {commandId})
      this.getEmitter().emit(AglynAppEventFlag.TRIGGERED_COMMAND_RESOLVER, {commandId})

      this.#commander.emit(`listener:${commandId}`, {data, resolved})
      this.getLogger().debug(AglynAppEventFlag.TRIGGERED_COMMAND_LISTENER, {commandId})
      this.getEmitter().emit(AglynAppEventFlag.TRIGGERED_COMMAND_LISTENER, {commandId})
    }
  }
  public unregisterListener = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_LISTENER],
  ): void => {
    const {listener} = data
    const commandId = listener?.commandId
    this.#commander.off(commandId, listener)
    this.getLogger().debug(AglynAppEventFlag.UNREGISTERED_COMMAND_LISTENER, {commandId})
    this.getEmitter().emit(AglynAppEventFlag.UNREGISTERED_COMMAND_LISTENER, {commandId})
  }
  public unregisterResolver = (
    data: AglynModuleActionPayload[AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_RESOLVER],
  ): void => {
    const {commandId: cId, resolver} = data
    const commandId = resolver?.commandId || cId
    delete this.#resolvers[commandId]
    this.getLogger().debug(AglynAppEventFlag.UNREGISTERED_COMMAND_RESOLVER, {commandId})
    this.getEmitter().emit(AglynAppEventFlag.UNREGISTERED_COMMAND_RESOLVER, {commandId})
  }


  private listeners: [AglynAppEffectFlag, (...args: any[]) => unknown][] = [
    [AglynAppEffectFlag.COMMAND_ACTION_REGISTER_RESOLVER, this.setResolver],
    [AglynAppEffectFlag.COMMAND_ACTION_REGISTER_LISTENER, this.onResolve],
    [AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_RESOLVER, this.unregisterResolver],
    [AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_LISTENER, this.unregisterListener],
    [AglynAppEffectFlag.COMMAND_TRIGGER, this.trigger],
  ]
}

export default AglynCommandController
