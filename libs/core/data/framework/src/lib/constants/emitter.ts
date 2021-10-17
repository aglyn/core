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


import { AnyProps, Dictionary } from '@aglyn/shared-data-types'
import { EmitterFn } from '@aglyn/shared-util-emitter'
import { Emitter } from 'mitt'
import { AglynCommandListener, AglynCommandResolver } from '../controllers/aglyn-command.controller'
import {
  AglynComponentElement,
  AglynComponentsBundle,
  AglynComponentSchema,
  AppUUN,
  BundleUId,
  CommandUId,
  ComponentId,
  ExtensionUUN,
} from '../controllers/aglyn-components.controller'
import type { AglynExtension } from '../models/aglyn-extension.model'
import { PayloadData } from '../types'


export enum AglynAppEventFlag {
  APP_CREATED = 'event:app:created', // 1
  APP_ON_INIT = 'event:app:on-init', // 2
  APP_INITIALIZED = 'event:app:initialized', // 3
  APP_ON_DESTROY = 'event:app:on-destroy', // 4
  APP_DESTROYED = 'event:app:destroyed', // 5
  APP_ON_DELETE = 'event:app:on-delete', // 6
  APP_DELETED = 'event:app:deleted', // 7

  REGISTERED_EXTENSION = 'event:extension:registered',
  INITIALIZED_EXTENSION = 'event:extension:initialized',
  LOADING_EXTENSION = 'event:extension:loading',
  LOADED_EXTENSION = 'event:extension:loaded',
  UNLOADING_EXTENSION = 'event:extension:unloading',
  UNLOADED_EXTENSION = 'event:extension:unloaded',
  DESTROYING_EXTENSION = 'event:extension:destroying',
  DESTROYED_EXTENSION = 'event:extension:destroyed',

  TRIGGERED_COMMAND_RESOLVER = 'event:command:trigger-resolver',
  REGISTERED_COMMAND_RESOLVER = 'event:command:registered-resolver',
  UNREGISTERED_COMMAND_RESOLVER = 'event:command:unregistered-resolver',
  TRIGGERED_COMMAND_LISTENER = 'event:command:triggered-listener',
  REGISTERED_COMMAND_LISTENER = 'event:command:registered-listener',
  UNREGISTERED_COMMAND_LISTENER = 'event:command:unregistered-listener',

  REGISTERING_COMPONENT = 'event:component:registering',
  REGISTERED_COMPONENT = 'event:component:registered',
  UNREGISTERING_COMPONENT = 'event:component:unregistering',
  UNREGISTERED_COMPONENT = 'event:component:unregistered',
  REGISTERING_COMPONENT_BUNDLE = 'event:component:registering-bundle',
  REGISTERED_COMPONENT_BUNDLE = 'event:component:registered-bundle',
  UNREGISTERING_COMPONENT_BUNDLE = 'event:component:unregistering-bundle',
  UNREGISTERED_COMPONENT_BUNDLE = 'event:component:unregistered-bundle',
}

export enum AglynAppEffectFlag {
  EXTENSION_REGISTER = 'effect:extension:register',
  EXTENSION_LOAD = 'effect:extension:load',
  EXTENSION_UNLOAD = 'effect:extension:unload',
  EXTENSION_DESTROY = 'effect:extension:destroy',

  COMMAND_ACTION_REGISTER_RESOLVER = 'effect:command:register-resolver',
  COMMAND_ACTION_UNREGISTER_RESOLVER = 'effect:command:unregister-resolver',
  COMMAND_ACTION_REGISTER_LISTENER = 'effect:command:register-listener',
  COMMAND_ACTION_UNREGISTER_LISTENER = 'effect:command:unregister-listener',
  COMMAND_TRIGGER = 'effect:command:trigger',

  COMPONENT_GET = 'effect:components:get-component',
  COMPONENTS_GET = 'effect:components:get-components',
  COMPONENT_REGISTER = 'effect:components:register-component',
  COMPONENT_UNREGISTER = 'effect:components:unregister-component',
  COMPONENTS_BUNDLE_REGISTER = 'effect:components:register-components-bundle',
  COMPONENTS_BUNDLE_UNREGISTER = 'effect:components:unregister-components-bundle',
}

export type EventPayload<T, K extends keyof T = keyof T> = Record<K, T[K]>

export type GetComponentPayload = PayloadData<{
  componentId: CommandUId
  bundleId?: BundleUId
}>
export type GetComponentsPayload = PayloadData<{
  ids?: { componentId: CommandUId, bundleId?: BundleUId }[]
}>
export type GetComponentSchemaPayload = PayloadData<{
  componentId: CommandUId
  bundleId?: BundleUId
}>
export type GetBundlePayload = PayloadData<{
  bundleId: BundleUId
}>
export type RegisterComponentPayload<P extends AnyProps = any> = PayloadData<{
  schema: AglynComponentSchema<P>
  component: AglynComponentElement<P>
}>
export type RegisterBundlePayload = PayloadData<{
  bundle: Omit<AglynComponentsBundle, 'componentIds'>
  components: RegisterComponentPayload[]
}>
export type UnregisterComponentPayload = PayloadData<{
  componentId: ComponentId
  bundleId: BundleUId
}>
export type UnregisterBundlePayload = PayloadData<{
  bundleId: BundleUId
}>

export interface AglynAppEventPayload extends Record<AglynAppEventFlag, AglynEmitterPayload> {
  [AglynAppEventFlag.APP_CREATED]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_ON_INIT]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_INITIALIZED]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_ON_DESTROY]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_DESTROYED]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_ON_DELETE]: PayloadData<{ appName: AppUUN }>
  [AglynAppEventFlag.APP_DELETED]: PayloadData<{ appName: AppUUN }>

  [AglynAppEventFlag.REGISTERED_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.DESTROYING_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.DESTROYED_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.INITIALIZED_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.LOADING_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.LOADED_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.UNLOADING_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEventFlag.UNLOADED_EXTENSION]: PayloadData<{ extensionName: ExtensionUUN }>

  [AglynAppEventFlag.TRIGGERED_COMMAND_RESOLVER]: PayloadData<{ commandId: CommandUId }>
  [AglynAppEventFlag.REGISTERED_COMMAND_RESOLVER]: PayloadData<{ commandId: CommandUId }>
  [AglynAppEventFlag.UNREGISTERED_COMMAND_RESOLVER]: PayloadData<{ commandId: CommandUId }>
  [AglynAppEventFlag.TRIGGERED_COMMAND_LISTENER]: PayloadData<{ commandId: CommandUId }>
  [AglynAppEventFlag.REGISTERED_COMMAND_LISTENER]: PayloadData<{ commandId: CommandUId }>
  [AglynAppEventFlag.UNREGISTERED_COMMAND_LISTENER]: PayloadData<{ commandId: CommandUId }>

  [AglynAppEventFlag.REGISTERING_COMPONENT]: PayloadData<{ componentId: ComponentId, bundleId?: BundleUId }>
  [AglynAppEventFlag.REGISTERED_COMPONENT]: PayloadData<{ componentId: ComponentId, bundleId?: BundleUId }>
  [AglynAppEventFlag.UNREGISTERING_COMPONENT]: PayloadData<{ componentId: ComponentId, bundleId?: BundleUId }>
  [AglynAppEventFlag.UNREGISTERED_COMPONENT]: PayloadData<{ componentId: ComponentId, bundleId?: BundleUId }>
  [AglynAppEventFlag.REGISTERING_COMPONENT_BUNDLE]: PayloadData<{ bundleId: BundleUId }>
  [AglynAppEventFlag.REGISTERED_COMPONENT_BUNDLE]: PayloadData<{ bundleId: BundleUId }>
  [AglynAppEventFlag.UNREGISTERING_COMPONENT_BUNDLE]: PayloadData<{ bundleId: BundleUId }>
  [AglynAppEventFlag.UNREGISTERED_COMPONENT_BUNDLE]: PayloadData<{ bundleId: BundleUId }>
}

export interface AglynModuleActionPayload extends Record<AglynAppEffectFlag, AglynEmitterPayload> {
  [AglynAppEffectFlag.EXTENSION_REGISTER]: PayloadData<{ extension: AglynExtension }>
  [AglynAppEffectFlag.EXTENSION_DESTROY]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEffectFlag.EXTENSION_LOAD]: PayloadData<{ extensionName: ExtensionUUN }>
  [AglynAppEffectFlag.EXTENSION_UNLOAD]: PayloadData<{ extensionName: ExtensionUUN }>

  [AglynAppEffectFlag.COMMAND_ACTION_REGISTER_RESOLVER]: PayloadData<{ resolver: AglynCommandResolver }>
  [AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_RESOLVER]: PayloadData<{ commandId?: CommandUId, resolver?: AglynCommandResolver }>
  [AglynAppEffectFlag.COMMAND_ACTION_REGISTER_LISTENER]: PayloadData<{ listener: AglynCommandListener }>
  [AglynAppEffectFlag.COMMAND_ACTION_UNREGISTER_LISTENER]: PayloadData<{ listener: AglynCommandListener }>
  [AglynAppEffectFlag.COMMAND_TRIGGER]: PayloadData<{ commandId: CommandUId } & Dictionary>

  [AglynAppEffectFlag.COMPONENT_GET]: GetComponentPayload
  [AglynAppEffectFlag.COMPONENTS_GET]: GetComponentsPayload
  [AglynAppEffectFlag.COMPONENT_REGISTER]: UnregisterComponentPayload
  [AglynAppEffectFlag.COMPONENT_UNREGISTER]: UnregisterComponentPayload
  [AglynAppEffectFlag.COMPONENTS_BUNDLE_REGISTER]: RegisterBundlePayload
  [AglynAppEffectFlag.COMPONENTS_BUNDLE_UNREGISTER]: UnregisterBundlePayload
}

export type AglynEventPayloads = EventPayload<AglynAppEventPayload> &
  EventPayload<AglynModuleActionPayload> &
  Record<string, AglynEmitterPayload>
export type AglynEmitterPayload = PayloadData<Dictionary>
export type AglynEmitter = Emitter<AglynEventPayloads>

export const AGLYN_EMITTER: AglynEmitter = EmitterFn()
