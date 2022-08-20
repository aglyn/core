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

import type { AglynBaseModelOptions } from '@aglyn/core-data-foundation'
import {
  _INTERNAL_CANVAS_,
  _INTERNAL_COMMANDS_,
  _INTERNAL_COMPONENTS_,
  _INTERNAL_CONTEXTS_,
  _INTERNAL_EXTENSIONS_,
  AGLYN_EMITTER,
  AGLYN_ERROR,
  AGLYN_LOGGER,
  AGLYN_PLATFORM,
  AglynAppOptions,
  AglynEffectOptions,
  type AglynEmitter,
  type AglynErrorFactory,
  type AglynEventPayloads,
  AglynEventStateFlag,
  AglynEventTriggerFlag,
  type AglynLogger,
  AglynPlatform,
  AglynVersion,
  AppUUN,
  IAglynCanvasController,
  IAglynCommandsController,
  IAglynComponentsController,
  IAglynContextsController,
  IAglynExtensionsController,
  IAglynModuleModel,
  SDK_VERSION,
} from '@aglyn/core-data-foundation'
import { compress, decompress } from '@aglyn/core-util-app'
import { _isArr } from '@aglyn/shared-util-guards'
import { ITimestamp, Timestamp } from '@aglyn/shared-util-timestamp'
import { getStaticField, truthy } from '@aglyn/shared-util-tools'
import { Bytes } from 'firebase/firestore'
import AglynCanvasController from '../controllers/aglyn-canvas.controller'
import AglynCommandsController from '../controllers/aglyn-commands.controller'
import AglynComponentsController from '../controllers/aglyn-components.controller'
import AglynContextsController from '../controllers/aglyn-contexts.controller'
import AglynExtensionsController from '../controllers/aglyn-extensions.controller'
import DependencyManager from './dependency-manager'

const TAG = 'Aglyn'
const NS = 'com.aglyn.core.data.model.base'

export default class Aglyn extends DependencyManager {
  public static readonly platform: AglynPlatform = AGLYN_PLATFORM
  public static readonly version: AglynVersion = SDK_VERSION
  readonly #appName: AppUUN = null
  #errorFactory: AglynErrorFactory
  #emitter: AglynEmitter
  #logger: AglynLogger
  #deleted = false
  #extensions: IAglynExtensionsController = null
  #contexts: IAglynContextsController = null
  #commands: IAglynCommandsController = null
  #components: IAglynComponentsController = null
  #canvas: IAglynCanvasController = null
  readonly #createdAt: ITimestamp
  readonly #options: AglynAppOptions = null

  //region Property Getters
  protected get modules(): IAglynModuleModel[] {
    return [
      // Load internal modules before extensions
      this.#contexts,
      this.#commands,
      this.#components,
      this.#canvas,

      // Last step
      this.#extensions,
    ]
  }
  public get [Symbol.toStringTag](): string {
    return getStaticField(Symbol.toStringTag, this)
  }
  public get appName(): AppUUN {
    return this.#appName
  }
  public get canvas(): IAglynCanvasController {
    return this.#canvas
  }
  public get commands(): IAglynCommandsController {
    return this.#commands
  }
  public get components(): IAglynComponentsController {
    return this.#components
  }
  public get contexts(): IAglynContextsController {
    return this.#contexts
  }
  public get createdAt(): ITimestamp {
    return this.#createdAt
  }
  public get deleted(): boolean {
    return this.#deleted
  }
  public get emitter(): AglynEmitter {
    return this.#emitter
  }
  public get errorFactory(): AglynErrorFactory {
    return this.#errorFactory
  }
  public get extensions(): IAglynExtensionsController {
    return this.#extensions
  }
  public get logger(): AglynLogger {
    return this.#logger
  }
  public get namespace(): string {
    return getStaticField('namespace', this)
  }
  public get options(): AglynAppOptions {
    return this.#options
  }
  public get platform(): AglynPlatform {
    return getStaticField('platform', this)
  }
  public get version(): AglynVersion {
    return getStaticField('version', this)
  }
  public static get [Symbol.toStringTag](): string {
    return TAG
  }
  public static get namespace(): string {
    return NS
  }
  //endregion

  constructor(options: AglynAppOptions) {
    super()
    this.#options = options
    this.#createdAt = Timestamp.now()
    this.setup()
  }

  private setup() {
    const namespace = this.namespace
    const errorFactory = this.#options.errorFactory || AGLYN_ERROR
    const logger = this.#options.logger || AGLYN_LOGGER
    const logLevel = this.#options.logLevel

    this.#errorFactory = !namespace
      ? errorFactory
      : errorFactory.childFactory(namespace)
    this.#emitter = this.#options.emitter || AGLYN_EMITTER
    this.#logger = !logLevel ? logger : logger.setLogLevel(logLevel)
  }

  public toString(): string {
    return `[object ${this[Symbol.toStringTag]}('${this.#appName}')]`
  }

  public toJSON() {
    return {
      namespace: this.namespace,
      created: this.#createdAt.toJSON(),
      name: this.#appName,
      version: this.version,
      platform: this.platform,
    }
  }

  //region Property Get Methods
  public getCanvasController(): IAglynCanvasController {
    return this.#canvas
  }
  public getCommandsController(): IAglynCommandsController {
    return this.#commands
  }
  public getComponentsController(): IAglynComponentsController {
    return this.#components
  }
  public getContextsController(): IAglynContextsController {
    return this.#contexts
  }
  public getCreatedAt(): ITimestamp {
    return this.#createdAt
  }
  public getExtensionsController(): IAglynExtensionsController {
    return this.#extensions
  }
  public getName(): AppUUN {
    return this.#appName
  }
  public getOptions(): AglynBaseModelOptions {
    return this.#options
  }
  //endregion

  //region Deletion Methods
  public isDeleted(): boolean {
    return truthy(this.#deleted)
  }
  public setDeleted(value: boolean): this {
    this.#deleted = Boolean(value)
    return this
  }
  //endregion

  //region Compression/Decompression Methods
  public static compress<T>(value: T): Bytes {
    return compress(value)
  }
  public static decompress<T>(value: Bytes): T {
    return decompress(value)
  }
  public compress<T>(value: T): Bytes {
    return Aglyn.compress(value)
  }
  public decompress<T>(value: Bytes): T {
    return Aglyn.decompress(value)
  }
  //endregion

  //region Modules/Extensions Methods
  #initializeAppModules(): void {
    for (const mod of this.modules) {
      this.addDependency(mod)
    }
  }
  #destroyAppModules(): void {
    for (const mod of this.modules) {
      this.removeDependency(mod.namespace)
    }
  }

  public setupModules() {
    this.handleEvent(
      [AglynEventStateFlag.APP_CREATING, AglynEventStateFlag.APP_CREATED],
      { appName: this.#appName },
      () => {
        this.#contexts = new AglynContextsController(this, {
          ...this.options.modulesOptions?.contexts,
        })
        this.#commands = new AglynCommandsController(this, {
          ...this.options.modulesOptions?.commands,
        })
        this.#components = new AglynComponentsController(this, {
          ...this.options.modulesOptions?.components,
        })
        this.#canvas = new AglynCanvasController(this, {
          ...this.options.modulesOptions?.canvas,
        })
        _INTERNAL_CONTEXTS_.set(this.#appName, this.#contexts)
        _INTERNAL_COMMANDS_.set(this.#appName, this.#commands)
        _INTERNAL_COMPONENTS_.set(this.#appName, this.#components)
        _INTERNAL_CANVAS_.set(this.#appName, this.#canvas)
      },
    )
    return this
  }
  public setupExtensions() {
    this.#extensions = new AglynExtensionsController(this, {
      ...this.options.modulesOptions?.extensions,
    })
    _INTERNAL_EXTENSIONS_.set(this.#appName, this.#extensions)
    return this
  }
  //endregion

  //region Internal Event Handling
  #doEvent<F extends AglynEventStateFlag>(
    flag: F,
    payload?: AglynEventPayloads[F],
  ): this {
    const mergedPayload = {
      ...payload,
      __eventTimestamp__: Timestamp.now().toJSON(),
      __eventController__: this.toJSON(),
    }
    this.logger.debug(flag, mergedPayload)
    this.emitter.emit(flag, mergedPayload)
    return this
  }
  #handleEvent<F1 extends AglynEventStateFlag, F2 extends AglynEventStateFlag>(
    flags: [before: F1, after: F2],
    payload:
      | undefined
      | AglynEventPayloads[F1 | F2]
      | [before: AglynEventPayloads[F1], after: AglynEventPayloads[F2]],
    handler: () => AglynEventPayloads[F2] | void,
  ): this {
    const [beforeFlag, afterFlag] = flags
    const beforePayload = _isArr(payload) ? payload[0] : payload
    this.#doEvent(beforeFlag, beforePayload)
    const res = handler()
    const afterPayload =
      res || (_isArr(payload) ? payload[1] || payload[0] : payload)
    this.#doEvent(afterFlag, afterPayload)
    return this
  }
  protected handleEvent<
    F1 extends AglynEventStateFlag,
    F2 extends AglynEventStateFlag,
  >(
    flags: [before: F1, after: F2],
    payload:
      | undefined
      | AglynEventPayloads[F1 | F2]
      | [before: AglynEventPayloads[F1], after: AglynEventPayloads[F2]],
    handler: () => AglynEventPayloads[F2] | void,
  ): this {
    this.#handleEvent(flags, payload, handler)
    return this
  }
  //endregion

  //region Lifecycle Methods
  //region Initialization Lifecycle Methods
  public onInitialize(): this {
    this.handleEvent(
      [
        AglynEventStateFlag.APP_INITIALIZING,
        AglynEventStateFlag.APP_INITIALIZED,
      ],
      { appName: this.#appName },
      () => {
        this.#initializeAppModules()
      },
    )
    return this
  }
  /** @ignore */
  public __initialize__(props?: never): this {
    this.handleEvent(
      [
        AglynEventStateFlag.MODULE_INITIALIZING,
        AglynEventStateFlag.MODULE_INITIALIZED,
      ],
      { namespace: this.namespace },
      () => {
        this.onInitialize()
      },
    )
    return this
  }
  //endregion

  //region Activation Lifecycle Methods
  public onActivate(): this {
    this.handleEvent(
      [AglynEventStateFlag.APP_ACTIVATING, AglynEventStateFlag.APP_ACTIVATED],
      { appName: this.#appName },
      () => {
        console.log('app onActivate')
      },
    )
    return this
  }
  /** @ignore */
  public __activate__(props?: never): this {
    this.handleEvent(
      [
        AglynEventStateFlag.MODULE_ACTIVATING,
        AglynEventStateFlag.MODULE_ACTIVATED,
      ],
      { namespace: this.namespace },
      () => {
        this.onActivate()
      },
    )
    return this
  }
  //endregion

  //region Deactivation Lifecycle Methods
  public onDeactivate(): this {
    this.handleEvent(
      [
        AglynEventStateFlag.APP_DEACTIVATING,
        AglynEventStateFlag.APP_DEACTIVATED,
      ],
      { appName: this.#appName },
      () => {
        console.log('app onDeactivate')
      },
    )
    return this
  }
  /** @ignore */
  public __deactivate__(props?: never): this {
    this.handleEvent(
      [
        AglynEventStateFlag.MODULE_DEACTIVATING,
        AglynEventStateFlag.MODULE_DEACTIVATED,
      ],
      { namespace: this.namespace },
      () => {
        this.onDeactivate()
      },
    )
    return this
  }
  //endregion

  //region Destruction Lifecycle Methods
  public onDestroy(): this {
    this.handleEvent(
      [AglynEventStateFlag.APP_DESTROYING, AglynEventStateFlag.APP_DESTROYED],
      { appName: this.#appName },
      () => {
        this.#destroyAppModules()
      },
    )
    return this
  }
  /** @ignore */
  __destroy__(props?: never): this {
    this.handleEvent(
      [
        AglynEventStateFlag.MODULE_DESTROYING,
        AglynEventStateFlag.MODULE_DESTROYED,
      ],
      { namespace: this.namespace },
      () => {
        this.onDestroy()
      },
    )
    return this
  }
  //endregion
  //endregion

  //region Error Factory Methods
  public getErrorFactory(): AglynErrorFactory {
    return this.#errorFactory
  }
  public setErrorFactory(value: AglynErrorFactory): this {
    this.#errorFactory = value
    return this
  }
  //endregion

  //region Emitter Methods
  public getEmitter(): AglynEmitter {
    return this.#emitter
  }
  public setEmitter(value: AglynEmitter): this {
    this.#emitter = value
    return this
  }
  public get all() {
    return this.#emitter.all
  }
  public on(type, handler) {
    return this.#emitter.on(type, handler)
  }
  public effect<U>(data: AglynEffectOptions<AglynEventTriggerFlag, U>): this {
    const { type, payload } = data
    this.emitter.emit(type, payload as any)
    return this
  }
  public off(type, handler?) {
    return this.#emitter.off(type, handler)
  }
  public emit(type, handler?) {
    return this.#emitter.emit(type, handler)
  }
  //endregion

  //region Logger Methods
  public getLogger(): AglynLogger {
    return this.#logger
  }
  public setLogger(value: AglynLogger): this {
    this.#logger = value
    return this
  }
  public setLogLevel(val) {
    return this.#logger.setLogLevel(val) as any
  }
  public setUserLogHandler(logCallback, options) {
    return this.#logger.setUserLogHandler(logCallback, options)
  }
  public debug(...args) {
    return this.#logger.debug(...args)
  }
  public error(...args) {
    return this.#logger.error(...args)
  }
  public info(...args) {
    return this.#logger.info(...args)
  }
  public log(...args) {
    return this.#logger.log(...args)
  }
  public warn(...args) {
    return this.#logger.warn(...args)
  }
  public get logHandler() {
    return this.#logger.logHandler
  }
  public get logLevel() {
    return this.#logger.logLevel
  }
  public get userLogHandler() {
    return this.#logger.userLogHandler
  }
  //endregion
}
