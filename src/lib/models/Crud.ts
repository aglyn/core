import { CrudModel } from './interfaces/crud-model'

/**
 * Methods (set, get, has, del) to c.r.u.d. an index of the data property
 *
 * @export
 * @abstract
 * @class Crud
 * @implements {Crud<T>}
 * @template T
 */
export abstract class Crud<T = any> implements CrudModel<T> {
  /**
   * Creates an instance of Crud.
   * @param {T} [data={} as any]
   * @memberof Crud
   */
  constructor(public readonly data: T = {} as any) { }

  /** @inheritdoc */
  toJSON(): T { return this.data }

  /** @inheritdoc */
  set<K extends keyof T>(id: K, value: any): this { this.data[id] = value; return this }

  /** @inheritdoc */
  get<K extends keyof T>(id: K): T[K] | null { return this.data[id] }

  /** @inheritdoc */
  has<K extends keyof T>(id: K): boolean { return Object.prototype.hasOwnProperty.call(this.data, id) }

  /** @inheritdoc */
  del<K extends keyof T>(id: K): this { delete this.data[id]; return this }

}