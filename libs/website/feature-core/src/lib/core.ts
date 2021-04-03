/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import DdfSchema from '@data-driven-forms/react-form-renderer/common-types/schema'
import EventEmitter from 'events'


export const eventEmitter: EventEmitter = new EventEmitter()

export enum EventKey {
  INSTANCE_CREATED = 'site.created-singleton-instance',
  COMPONENT_REGISTERED = 'site.registered-site-component',
}

export namespace SC {
  export const components: Map<string, SC.ComponentModel> = new Map()

  export enum RestrictType {
    LIMIT = 'limit',
    DISALLOW = 'disallow',
  }

  export type AnyProps = Record<string, unknown>

  export interface Component {
    _id: string
    ClassFn?: any
    name: string
    description?: string
    title?: string
    subtitle?: string
    icon?: any
    defaultProps?: Partial<AnyProps>
    propsSchema?: DdfSchema
    resolveProps?: <T>(...args: T[]) => Partial<AnyProps> | void
    options?: {
      disableActions?: boolean
      disableBadge?: boolean
      disableCopying?: boolean
      disableDragging?: boolean
      disableDropping?: boolean
      disableEditing?: boolean
      disableNesting?: boolean
      disableOutline?: boolean
      disableRemoving?: boolean
      disableSelecting?: boolean
      restrictChildren?: [type: RestrictType, ids: string[]]
      restrictParents?: [type: RestrictType, ids: string[]]
    }
  }

  export class ComponentModel {
    public static readonly event: EventEmitter = eventEmitter
    constructor(public config: Component) {}
  }

}

export interface Element {
  _id: string
  component?: SC.Component | string
  children?: Element[]
  props: SC.AnyProps
  temp?: boolean
  parent?: string
  name?: string
  description?: string
}


export function core() {
  return 'core'
}
