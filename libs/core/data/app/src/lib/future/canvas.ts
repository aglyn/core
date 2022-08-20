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

import { nanoid } from 'nanoid'
import Node, { type NodeId, type NodeSchema } from './node'

const NODE_ID_LENGTH = 10

export default class CanvasManager {
  public static Node = Node
  public nodes = new Map<NodeId, Node<any>>()

  constructor(nodes: Record<NodeId, NodeSchema>) {
    Object.entries(nodes).forEach(([, schema]) => {
      this.setNode(new CanvasManager.Node(schema))
    })
  }

  public toJSON(): Record<NodeId, NodeSchema> {
    return Object.fromEntries(this.nodes)
  }

  public static createNodeId(): string {
    return nanoid(NODE_ID_LENGTH)
  }

  public static createNode<P>(schema: Omit<NodeSchema<P>, '$id'>): Node<P> {
    const $id = CanvasManager.createNodeId()
    return new CanvasManager.Node({ ...schema, $id })
  }

  public setNode<P>(node: Node<P>): this {
    this.nodes.set(node.$id, node)
    return this
  }

  public deleteNode<P>(node: Node<P>): this {
    this.nodes.delete(node.$id)
    return this
  }

  public getNode<P>($id: NodeId): Node<P> | undefined {
    return this.nodes.get($id)
  }

  public duplicateNode<P>(node: Node<P>): Node<P> {
    return CanvasManager.createNode({ ...node.toJSON() })
  }

  public reparentNode(
    node: Node<any>,
    oldParent: Node<any>,
    newParent: Node<any>,
    index: number,
  ): this {
    oldParent.elements = oldParent.elements.filter((id) => id !== node.$id)
    node.parentId = newParent.$id
    if (isNaN(index)) newParent.elements.push(node.$id)
    else newParent.elements.splice(index, 0, node.$id)

    this.nodes.set(oldParent.$id, oldParent)
    this.nodes.set(newParent.$id, newParent)
    this.nodes.set(node.$id, node)
    return this
  }
}
