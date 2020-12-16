import { Base, BaseModel } from './crud'
import { _isObj } from './guards'
import { Dictionary, ID } from './types'


/** A document-oriented db document field type */
export type FieldType<T extends Dictionary = any> = { [P in keyof T]: T[P] }

/**
 * Instance outline base for all documents in the DB
 *
 * @export
 * @interface DocumentModel
 * @extends {CrudModel}
 * @template F
 */
export interface FieldModel<SF extends FieldModel = any> extends BaseModel, IterableIterator<SF> {

  model?: new (...args: any[]) => SF

  fields: SF[]

  getAllFields(): SF[]
  getFieldById(id: ID): SF | undefined
  getFieldById(...ids: ID[]): SF[]
  getFieldById(id: ID, ...ids: ID[]): SF | SF[] | undefined

  addField(item: SF): this

  removeField(id: ID): this
  removeField(item: SF): this
  removeField(item: ID | SF): this

  length: number
  [Symbol.iterator](): IterableIterator<SF>
  next(): IteratorResult<SF>
}

/**
 * Provides base logic for all documents in the DB
 *
 * @export
 * @class Field
 * @implements {FieldModel<F>}
 * @template F
 */
export class Field<SF extends FieldModel = FieldModel> extends Base implements FieldModel<SF> {

  public model: new (...args: any[]) => SF = Field as any

  public get fields(): SF[] { return this.data['fields'] }
  public set fields(v: SF[]) { this.data['fields'] = v }

  public get length(): number { return (this.fields ?? []).length }

  /**
   * Initialize the instance, should be called immediately after
   * creating the object
   *
   * @public
   * @memberof Field
   */
  init(): this {
    this.preInit && this.preInit()
    this.initFields()
    this.onInit && this.onInit()
    return this
  }

  protected initFields() {
    console.debug('initFields', this.id, this.fields)
    // Ensure if items are an object we ensure they are a document instance
    this.fields = (this.fields ??= []).map(item => {
      if (_isObj(item) && !(item instanceof this.model)) {
        return this.createField(item).init()
      }
      return item
    })
  }

  createField(...args: any[]): SF {
    return new this.model(...args)
  }
  addField(item: SF): this {
    (this.fields ??= []).push(item)
    return this
  }
  getAllFields(): SF[] {
    return this.fields
  }
  getFieldById(id: ID): SF | undefined
  getFieldById(...ids: ID[]): SF[]
  getFieldById(id: ID, ...ids: ID[]): SF | SF[] | undefined {
    if (ids.length) {
      const _ids = Array.from([id, ...ids])
      return this.fields?.filter(d => _ids.some(i => i === d?.id))
    }
    return this.fields?.find(i => i?.id === id)
  }
  removeField(id: ID): this
  removeField(item: SF): this
  removeField(item: ID | SF): this {
    const _item = _isObj(item) ? item : this.getFieldById(item)
    const items = Array.from(this.fields)
    this.fields = items.filter(i => i != _item)
    return this
  }


  private __index__ = 0;
  /** @inheritdoc */
  [Symbol.iterator](): IterableIterator<SF> { return this }
  /** @inheritdoc */
  next(): IteratorResult<SF> {
    if (this.__index__ < this.length) {
      return {
        done: false,
        value: this.fields[this.__index__++]
      }
    } else {
      return {
        done: true,
        value: null
      }
    }
  }

}