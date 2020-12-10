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
 * @template F
 */
export interface DocumentModel<F = any> extends CrudModel {
  fields: Readonly<F>

  getId(): string | undefined
  getFields(): F

  preInit?(): void
  init(...args: any[]): this
  onInit?(): void

  toJSON(): Dictionary
}

/**
 * Provides base logic for all documents in the DB
 *
 * @export
 * @class Document
 * @implements {DocumentModel<F>}
 * @template F
 */
export class Document<F = any> implements DocumentModel<F> {

  constructor(public fields: Readonly<F> | F = {} as any) { }

  getFields(): Readonly<F> | F { return this.fields }
  getId(): string | undefined { return this.get('id') }

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
    // this.fields && mapObject(this.fields ?? {}, ((v, k) => this.set(s(k), v)), { forEach: true })
    // TODO: Initialize?
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

  set(id: ID, v: any): this { this.fields[id] = v; return this }
  get(id: ID): any { return this.fields[id] }
  del(id: ID): this { delete this.fields[id]; return this }
  has(id: ID): boolean { return Object.prototype.hasOwnProperty.call(this.fields, id) }

  toJSON(): Dictionary { return { ...this.fields } }
}