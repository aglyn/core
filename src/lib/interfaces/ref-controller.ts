import { ID } from '../types'

import { CrudModel } from "./crud"
import { Dod } from './dod'
import { Initializable } from './initializable'
import { NormalizedData } from './normalized'

/**
 * Describes the base model object
 *
 * @export
 * @interface BaseModel
 * @extends {Initializable}
 * @extends {Crud<T>}
 * @extends {toJSON<T>}
 * @template T
 */
export interface BaseRef<T extends Dod.Ref.Id = Dod.Ref.Id> extends Initializable, CrudModel<T> {
  id: ID
}

/**
 * Instance outline base for all documents in the DB
 *
 * @export
 * @interface FieldRef
 * @extends {Dod.FieldRef<T>}
 * @extends {BaseRef<Dod.FieldRef<T>>}
 * @template T
 */
export interface FieldRef<T extends Dod.FieldValueType = Dod.FieldValueType> extends Dod.Ref.FieldRef<T>, BaseRef<Dod.Ref.FieldRef<T>> {

  readonly value: T | null
  readonly kind: string | number

  getValue(): T | null
  setValue(value: T): this

  getKind(): string | number
  setKind(value: string | number): this

}

/**
 * Instance outline base for all documents in the DB
 *
 * @export
 * @interface DocumentRef
 * @extends {Dod.DocumentRef<FT, ST>}
 * @extends {BaseRef<Dod.DocumentRef<FT, ST>>}
 * @template FT
 * @template ST
 */
export interface DocumentRef<FT extends FieldRef = FieldRef, ST extends CollectionRef = CollectionRef> extends Dod.Ref.DocumentRef<FT, ST>, BaseRef<Dod.Ref.DocumentRef<FT, ST>> {

  fieldModel: new (...args: any[]) => FT
  subcollectionModel: new (...args: any[]) => ST

  readonly fields: NormalizedData<FT>
  readonly subcollections: NormalizedData<ST>

  createField(...args: any[]): FT
  createSubcollection(...args: any[]): ST

  setField(id: ID, value: FT, index?: number): this
  setSubcollection(id: ID, value: ST, index?: number): this

  getField(id: ID): FT | null
  getSubcollection(id: ID): ST | null

  removeField(id: ID): this
  removeSubcollection(id: ID): this

  getAllFields(): FT[]
  getAllSubcollections(): ST[]

  setFields(fields: NormalizedData<FT>): this
  setSubcollections(collections: NormalizedData<ST>): this

}


/**
 * Instance outline for modeling a collection of documents
 *
 * @export
 * @interface CollectionRef
 * @extends {DocumentRef<F>}
 * @extends {IterableIterator<D>}
 * @template D
 * @template F
 */
export interface CollectionRef<D extends DocumentRef = any> extends Dod.Ref.CollectionRef<D>, BaseRef<Dod.Ref.CollectionRef<D>> {

  documentModel: new (...args: any[]) => D
  readonly documents: NormalizedData<D>
  readonly length: number

  createDocument(...args: any[]): D
  setDocument(id: ID, value: D, index?: number): this
  getDocument(id: ID): D | null
  removeDocument(id: ID): this
  getAllDocuments(): D[]
  setDocuments(documents: NormalizedData<D>): this

}