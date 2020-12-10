import { ID } from './../types/data'
import { Document, DocumentModel } from './document'

/**
 * Instance outline for modeling a collection of documents
 *
 * @export
 * @interface CollectionModel
 * @extends {DocumentModel<F>}
 * @extends {IterableIterator<T>}
 * @template T
 * @template F
 */
export interface CollectionModel<T extends Document = Document, F = any> extends DocumentModel<F>, IterableIterator<T> {
  model: new (...args: any[]) => T
  items: T[]

  getItem(id: ID): T
  addItem(item: T): this
  createItem(...args: any[]): T
  deleteItem(...args: any[]): this

  length: number
  [Symbol.iterator](): IterableIterator<T>
  next(): IteratorResult<T>
}

/**
 * Provides logic for modeling collections of documents
 *
 * @export
 * @class Collection
 * @extends {Document<F>}
 * @implements {CollectionModel<T, F>}
 * @template T
 * @template F
 */
export class Collection<T extends Document = Document, F = any> extends Document<F> implements CollectionModel<T, F> {

  public model: new (...args: any[]) => T
  public get items(): T[] { return this.get('items') }
  public set items(v: T[]) { this.set('items', v) }
  public get length(): number { return (this.items ?? []).length }

  getItem(id: ID): T {
    return this.items.find(i => i?.getId() === id)
  }

  getItems(ids?: ID[]): T[] {
    return ids ? Array.from(ids).map(id => this.getItem(id)) : this.items
  }

  addItem(item: T): this {
    (this.items ??= []).push(item)
    return this
  }

  createItem(...args: any[]): T {
    return new this.model(...args)
  }

  deleteItem(item: T): this {
    const items = Array.from(this.items)
    this.items = items.filter(i => i != item)
    return this
  }

  private __index__ = 0;
  /** @inheritdoc */
  [Symbol.iterator](): IterableIterator<T> { return this }
  /** @inheritdoc */
  next(): IteratorResult<T> {
    if (this.__index__ < this.length) {
      return {
        done: false,
        value: this.items[this.__index__++]
      }
    } else {
      return {
        done: true,
        value: null
      }
    }
  }
}