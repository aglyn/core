import { Dod } from '../interfaces/dod'
import { NormalizedData } from '../interfaces/normalized'
import { CollectionRef, DocumentRef, FieldRef } from '../interfaces/ref-controller'
import { Normalized } from '../models/normalized'
import { ID } from '../types'

import { BaseRefController } from './BaseRefController'
import { CollectionRefController } from './CollectionRefController'
import { FieldRefController } from './FieldRefController'




/**
 * Provides base logic for all documents in the DB
 *
 * @export
 * @class DocumentRefController
 * @extends {BaseRefController<Dod.DocumentRef<FT, ST>>}
 * @implements {DocumentRef<FT, ST>}
 * @template FT
 * @template ST
 */
export class DocumentRefController<FT extends FieldRef = FieldRef, ST extends CollectionRef = CollectionRef> extends BaseRefController<Dod.Ref.DocumentRef<FT, ST>> implements DocumentRef<FT, ST> {

  public fieldModel: new (...args: any[]) => FT = FieldRefController as any
  public subcollectionModel: new (...args: any[]) => ST = CollectionRefController as any

  public get fields(): NormalizedData<FT> { return this.get('fields') }
  public get subcollections(): NormalizedData<ST> { return this.get('subcollections') }

  constructor(id: ID, fields?: NormalizedData<FT>, subcollections?: NormalizedData<ST>) {
    super({
      id,
      fields: new Normalized(fields),
      subcollections: new Normalized(subcollections)
    })
  }

  public static from<T extends Dod.Ref.DocumentRef>(data: T) {
    return new this(data?.id, <any>data?.fields, <any>data?.subcollections)
  }

  /**
   * Initialize the instance, should be called immediately after
   * creating the object
   *
   * @public
   * @memberof DocumentRefController
   */
  public init(): this {
    this.preInit && this.preInit()
    this.initFields()
    this.initSubcollections()
    this.onInit && this.onInit()
    return this
  }

  protected initFields() {
    console.debug('initFields', this.id, this.fields)
    // Ensure if items are an object we ensure they are a document instance
    if (!(this.fields instanceof Normalized)) {
      this.setFields(new Normalized(this.fields))
    }
    if (this.fields instanceof Normalized) {
      this.fields.toArray().forEach(field => {
        if (!(field instanceof FieldRefController)) {
          this.setField(
            field.id, this.createField(field).init()
          )
        }
      })
    }
  }

  protected initSubcollections() {
    console.debug('initSubcollections', this.id, this.subcollections)
    // Ensure if items are an object we ensure they are a document instance
    if (!(this.subcollections instanceof Normalized)) {
      this.setSubcollections(new Normalized(this.subcollections))
    }
    if (this.subcollections instanceof Normalized) {
      this.subcollections.toArray().forEach(col => {
        if (!(col instanceof CollectionRefController)) {
          this.setSubcollection(
            col.id, this.createSubcollection(col).init()
          )
        }
      })
    }
  }

  public createField(data?): FT {
    const { id, kind, value } = data
    return new this.fieldModel(id, kind, value)
  }

  public createSubcollection(data): ST {
    const { id, documents } = data
    return new this.subcollectionModel(id, documents)
  }

  public setField(id: ID, value: FT, index?: number): this {
    Normalized.set([id, value], this.fields, index)
    return this
  }

  public setSubcollection(id: ID, value: ST, index?: number): this {
    Normalized.set([id, value], this.subcollections, index)
    return this
  }

  public getField(id: ID): FT | null {
    return Normalized.get(id, this.fields)
  }

  public getSubcollection(id: ID): ST | null {
    return Normalized.get(id, this.subcollections)
  }

  public removeField(id: ID): this {
    Normalized.remove(id, this.fields)
    return this
  }

  public removeSubcollection(id: ID): this {
    Normalized.remove(id, this.subcollections)
    return this
  }

  public getAllFields(): FT[] {
    return Normalized.toArray(this.fields)
  }

  public getAllSubcollections(): ST[] {
    return Normalized.toArray(this.subcollections)
  }

  public setFields(fields: NormalizedData<FT>): this {
    this.set('fields', fields instanceof Normalized
      ? fields : new Normalized(fields)
    )
    return this
  }

  public setSubcollections(collections: NormalizedData<ST>): this {
    this.set('subcollections', collections instanceof Normalized
      ? collections : new Normalized(collections)
    )
    return this
  }


}