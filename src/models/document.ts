import { mapObject, s } from '../lib/utils'
import { CrudModel } from '../types/crud'
import { Dictionary, ID } from '../types/data'


/** A document-oriented db document type */
export type DocumentType<T extends Dictionary = any> = { [P in keyof T]: T[P] }

/**
 * Instance outline base for all documents in the DB
 *
 * @export
 * @interface DocumentModel
 * @extends {CrudModel}
 * @template T
 */
export interface DocumentModel extends CrudModel {

  id: string | undefined

  preInit?(): void
  init(...args: any[]): this
  onInit?(): void

  has(id: ID): boolean
  get(id: ID): any
  set(id: ID, item: any): this
  del(id: ID): this

  toJSON(): object

}

/**
 * Provides base logic for all documents in the DB
 *
 * @export
 * @class Document
 * @implements {DocumentModel}
 * @template T
 */
export class Document implements DocumentModel {

  get data(): Dictionary { return this.__data__ }

  get id(): string | undefined { return this.get('id') }
  set id(v: string) { this.set('id', v) }

  constructor(protected readonly __data__: Dictionary = {}) { }

  /**
   * Hook called before init
   *
   * @protected
   * @memberof Document
   */
  preInit?(): void

  /**
   * Initialize the instance, should be called immediately after
   * creating the object
   *
   * @public
   * @memberof Document
   */
  init(): this {
    this.preInit && this.preInit()
    this.data && mapObject(this.data, ((v, k) => this.set(s(k), v)), { forEach: true })
    this.onInit && this.onInit()
    return this
  }

  /**
   * Hook called after init
   *
   * @protected
   * @memberof Document
   */
  onInit?(): void

  set(id: ID, v: any): this { this.__data__[id] = v; return this }
  get(id: ID): any { return this.__data__[id] }
  del(id: ID): this { delete this.__data__[id]; return this }
  has(id: ID): boolean { return Object.prototype.hasOwnProperty.call(this.__data__, id) }

  toJSON(): Dictionary { return { ...this.__data__ } }
}