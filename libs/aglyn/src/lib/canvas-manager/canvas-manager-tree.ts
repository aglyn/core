/**
 * @license
 * Copyright 2023 Aglyn LLC
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
  _NotCustomized,
  IAnyModelType,
  IArrayType,
  IModelType,
  Instance,
  ISimpleType,
  types,
} from 'mobx-state-tree'

const IdType = types.identifier
export type INode = Instance<typeof Node>

export interface Node
  extends IModelType<
    {
      $id: ISimpleType<string>
      name: ISimpleType<string>
      nodes: IArrayType<IAnyModelType>
    },
    {},
    _NotCustomized,
    _NotCustomized
  > {}

export const Node = types.model('AglynNode', {
  $id: IdType,
  name: types.string,
  nodes: types.array(types.late((): IAnyModelType => Node)),
})

Node.create({})
