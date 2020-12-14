import { ID } from './types'

/**
 * Local properties and methods required for CRUD logic
 * (create, read, update delete)
 *
 * @export
 * @interface CrudData
 * @template T
 */
export interface CrudModel {
  has(id: ID): boolean
  get(id: ID): any
  set(id: ID, item: any): this
  del(id: ID): this
}