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

import { AglynExtension, AglynExtensionConfig } from '@aglyn/framework/sdk'
import { LifecycleFlag } from '@aglyn/shared/util/types'
import { EXTENSION_TYPE, MODULE_TYPE, TypeKind, TypeOf } from '../aglyn-symbol'


const TAG = 'AglynExtension'

export abstract class AglynExtensionModel implements AglynExtension {

  public static readonly [TypeOf] = MODULE_TYPE
  public static readonly [TypeKind] = EXTENSION_TYPE
  protected static __$ID__: string = null
  public context?: any = null
  public readonly config: AglynExtensionConfig = {autoload: true}
  public [Symbol.toStringTag] = TAG
  #lifecycle?: LifecycleFlag = null
  public get [TypeOf]() {return AglynExtensionModel[TypeOf]}
  public get [TypeKind]() {return AglynExtensionModel[TypeKind]}
  public get lifecycle() { return this.#lifecycle }
  public set lifecycle(value) {
    if (value in LifecycleFlag) {
      this.#lifecycle = value
    }
  }
  public get $id() { return AglynExtensionModel.__$ID__ }
  protected constructor() {

  }
  protected getContext() { return this.context }
  protected setContext(value) { this.context = value }
  public toString() {
    const pfx = TAG
    const extensionId = AglynExtensionModel.__$ID__ ?? 'NONE'
    return `${pfx}(id: '${extensionId}')`
  }
  public toJSON() {
    return {
      [TypeOf]: AglynExtensionModel[TypeOf],
      [TypeKind]: AglynExtensionModel[TypeKind],
      $id: AglynExtensionModel.__$ID__,
    }
  }

}
