/**
 * @license
 * Copyright (c) 2021 Aglyn LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the root directory of this source tree.
 */

import { eventEmitter, EventKey, SC } from './core'
import EventEmitter from 'events'

const PKG_VERSION = JSON.stringify(process.env.PKG_VERSION ?? 'N/A')
const PRODUCTION = process.env.NODE_ENV === 'production'



export class App {
  private static instance?: App

  public static readonly version: string = PKG_VERSION
  public static readonly production: boolean = PRODUCTION
  public static readonly development: boolean = !App.production
  public static readonly event: EventEmitter = eventEmitter

  public env = 'production'

  /**
   * Get the currently living singleton instance of Website
   * @throws
   * @returns {App} instance
   */
  public static getInstance(): App {
    if (App.instance instanceof App) {
      return App.instance
    }
    throw new Error("Instance doesn't exist! You must call createInstance(...) first!")
  }

  /**
   * Creates a new singleton instance of App
   * @throws
   */
  public static createInstance() {
    if (App.instance instanceof App) {
      throw new Error('Instance exist! You have already created an instance.')
    }
    App.instance = new App()
    App.event.emit(EventKey.INSTANCE_CREATED, this, App.instance)
  }

  /**
   * Builds and registers a {@link SC.ComponentModel} instance from the
   * provided {@link SC.Component}
   * @throws
   * @param {SC.Component['ClassFn']} component
   * @param {SC.Component} options
   * @return {SC.ComponentModel} Reference to the newly created model
   */
  public static registerWebsiteComponent(component: SC.Component['ClassFn'], options: SC.Component): SC.ComponentModel {
    const { _id, ClassFn: _, ...opts } = options
    if (SC.components.has(_id)) {
      throw new Error(`Site component with same ID(${_id}) already exists!`)
    }
    const model = new SC.ComponentModel({ ...opts, ClassFn: component, _id })
    SC.components.set(_id, model)
    App.event.emit(EventKey.COMPONENT_REGISTERED, this, model)
    return model
  }

}


export function app() {
  return 'app'
}
