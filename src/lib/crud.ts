import { Dictionary, ID } from './types'

/**
 * JSONable interface for class method
 *
 * @export
 * @interface toJSON
 * @template T
 */
export interface toJSON<T> {
  toJSON(): T
}

/**
 * Init hooks for object methods
 *
 * @export
 * @interface InitHooks
 */
export interface InitHooks {
  preInit?(): void
  init(...args: any[]): this
  onInit?(): void
}

/**
 * Local properties and methods required for CRUD logic
 * (create, read, update delete)
 *
 * @export
 * @interface CrudModel
 * @template T
 */
export interface CrudModel<T = any> {
  readonly data: Dictionary
  set(id: ID, value: T): this
  get(id: ID): T | undefined
  has(id: ID): boolean
  del(id: ID): this
}

/**
 * Set, get, has, del methods to retrieve index of data property
 *
 * @export
 * @abstract
 * @class Crud
 * @implements {CrudModel<T>}
 * @template T
 */
export abstract class Crud<T = any> implements CrudModel<T> {
  constructor(public readonly data: Dictionary = {} as any) { }

  set(id: ID, value: T): this { this.data[id] = value; return this }
  get(id: ID): T | undefined { return this.data[id] }
  has(id: ID): boolean { return Object.prototype.hasOwnProperty.call(this.data, id) }
  del(id: ID): this { delete this.data[id]; return this }
}

export interface BaseModel<T = any> extends InitHooks, CrudModel<T>, toJSON<Dictionary<T>> {
  id: ID
}

export class Base<T = any> extends Crud<T> implements BaseModel<T> {

  public get id(): ID { return this.data['id'] }
  public set id(v: ID) { this.data['id'] = v }

  /**
   * Called from JSON.stringify(base)
   *
   * @returns {Dictionary}
   * @memberof Base
   */
  toJSON(): Dictionary { return { ...this.data } }

  /**
   * Hook called before init
   *
   * @protected
   * @memberof Base
   */
  preInit?(): void

  /**
   * Initialize the instance, should be called immediately after
   * creating the object. If overridden you must call preInit and
   * onInit yourself, do not super this method.
   *
   * @public
   * @memberof Field
   */
  init(): this {
    this.preInit && this.preInit()
    this.onInit && this.onInit()
    return this
  }

  /**
   * Hook called after init
   *
   * @protected
   * @memberof Field
   */
  onInit?(): void

}