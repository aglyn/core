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

import {type AglynAppEffectFlag, type AglynModuleEffectPayload} from '../constants/emitter'
import {type OF_KIND, type OF_TYPE} from '../constants/symbol'
import {type IAglynAppController} from '../controllers/aglyn-app.types'
import {type AglynBaseModelOptions, AglynBaseModelT, IAglynBaseModel} from './aglyn-base.types'


export type AglynModuleEffectListener<Effect extends AglynAppEffectFlag> = [
  Effect,
  (args: AglynModuleEffectPayload[Effect]) => unknown
]

export interface AglynModuleModelOptions extends AglynBaseModelOptions {

}

export interface IAglynModuleModel<O extends AglynModuleModelOptions = AglynModuleModelOptions> extends IAglynBaseModel<O, IAglynAppController> {
  readonly [OF_TYPE]: number | symbol
  readonly [OF_KIND]: number | symbol
  readonly namespace: string
}

export interface AglynModuleModelT<O extends AglynModuleModelOptions = AglynModuleModelOptions> extends AglynBaseModelT<O, IAglynAppController> {
  new(app: IAglynAppController, options: O): IAglynModuleModel<O>
  readonly [Symbol.toStringTag]: string
  readonly [OF_TYPE]: number | symbol
  readonly [OF_KIND]: number | symbol
  readonly namespace: string
}
