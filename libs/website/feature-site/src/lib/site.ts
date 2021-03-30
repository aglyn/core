/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import type DdfSchema from '@data-driven-forms/react-form-renderer/common-types/schema'
import EventEmitter from 'events'

const PKG_VERSION = JSON.stringify(process.env.PKG_VERSION ?? 'N/A')
const PRODUCTION = process.env.NODE_ENV === 'production'

const siteEmitter = new EventEmitter()

export enum SiteEvent {
  INSTANCE_CREATED = 'site.created-singleton-instance',
  COMPONENT_REGISTERED = 'site.registered-site-component',
}
export enum RestrictType {
  LIMIT = 'limit',
  DISALLOW = 'disallow',
}

export type AnyProps = Record<string, unknown>
export type SiteComponentsMap = Map<string, SiteComponentModel>
export interface SiteComponent {
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
    restrictChildren?: [type: RestrictType, componentIds: string[]]
    restrictParents?: [type: RestrictType, componentIds: string[]]
  }
}
export class SiteComponentModel {
  public static readonly event: EventEmitter
  constructor(public config: SiteComponent) {}
}
export interface SiteElement {
  _id: string
  component?: SiteComponent | string
  children?: SiteElement[]
  props: AnyProps
  temp?: boolean
  parent?: string
  name?: string
  description?: string
}

class Site {
  private static instance?: Site

  public static readonly version: string = PKG_VERSION
  public static readonly production: boolean = PRODUCTION
  public static readonly development: boolean = !Site.production
  public static readonly event: EventEmitter = siteEmitter
  public static readonly siteComponents: SiteComponentsMap = new Map()

  /**
   * Get the currently living singleton instance of Site
   * @throws
   * @returns {Site} instance
   */
  public static getInstance(): Site {
    if (Site.instance instanceof Site) {
      return Site.instance
    }
    throw new Error("Instance doesn't exist! You must call createInstance(...) first!")
  }

  /**
   * Creates a new singleton instance of Site
   * @throws
   */
  public static createInstance() {
    if (Site.instance instanceof Site) {
      throw new Error('Instance exist! You have already created an instance.')
    }
    Site.instance = new Site()
    Site.event.emit(SiteEvent.INSTANCE_CREATED, this.instance)
  }

  /**
   * Builds and registers a SiteComponentModel instance from the provided
   * SiteComponent options
   * @throws
   * @param {*} component
   * @param {SiteComponent} options
   * @return {SiteComponentModel} Reference to the newly created model
   */
  public static registerSiteComponent(component: any, options: SiteComponent): SiteComponentModel {
    const { _id, ...opts } = options
    if (Site.siteComponents.has(_id)) {
      throw new Error(`SiteComponent with same ID(${_id}) already exists!`)
    }
    const model = new SiteComponentModel({
      ...opts,
      ClassFn: component,
      _id,
    })
    Site.siteComponents.set(_id, model)
    Site.event.emit(SiteEvent.COMPONENT_REGISTERED, Site.instance, model)
    return model
  }
}

export function site() {
  return 'site'
}
