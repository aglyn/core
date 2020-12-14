import { Dictionary, FieldType, ID } from './types'
import { numeronym, sortBy } from './utils'


/**
 * The classification to describe the Document model instance
 */
export enum Classification {
  FIELD = 'f3d',
  DOCUMENT = 'd6t',
  COLLECTION = 'c8n',
  SUB_COLLECTION = 's12n',
  VALUE = 'v3e',
}

/**
 * Used for local reference to specify/determine remote data type in storage
 * All values stored are critically dependent on the values of the enum named constants
 */
export type DataTypeConfig = {
  id?: string
  name: string
}
export function buildDataType(cnf: DataTypeConfig) {
  const id = numeronym(cnf.name.toLowerCase())
  return { ...cnf, id }
}

/**
 * Data kind
 *
 * @export
 * @enum {string}
 */
export enum DK {
  ARRAY = 'a3y',
  BOOLEAN = 'b5n',
  COLLECTION = 'c8n',
  BLOB = 'b3s',
  DATETIME = 'd6e',
  DOCUMENT = 'd6t',
  DICTIONARY = 'd8y',
  FLOAT = 'f3t',
  GEOPOINT = 'g6t',
  INTEGER = 'i5r',
  NULL = 'n2l',
  RELATION = 'r6n',
  TEXT = 't2t',
}

// export const DKMeta = mapObject(DK, (value, key) => {
//   const nym =

// })

// const a = mapObject(DK, (v, k, i, arr) => {
//   console.log('Zach last prt differ on enumerate', 'i', i, JSON.stringify(arr))
//   return v + 'aa'
// })

export const dataTypes = {
  ARRAY: buildDataType({ name: 'Array' }),
  BOOLEAN: buildDataType({ name: 'Boolean' }),
  BYTES: buildDataType({ name: 'Bytes' }),
  DATETIME: buildDataType({ name: 'DateTime' }),
  FLOAT: buildDataType({ name: 'Float' }),
  GEOPOINT: buildDataType({ name: 'GeoPoint' }),
  INTEGER: buildDataType({ name: 'Integer' }),
  MAP: buildDataType({ name: 'Map' }),
  NULL: buildDataType({ name: 'Null' }),
  RELATION: buildDataType({ name: 'Relation' }),
  TEXT: buildDataType({ name: 'Text' }),
}

export const DataFlags = [
  DK.ARRAY,
  DK.BOOLEAN,
  DK.BLOB,
  DK.DATETIME,
  DK.FLOAT,
  DK.GEOPOINT,
  DK.INTEGER,
  DK.DICTIONARY,
  DK.NULL,
  DK.RELATION,
  DK.TEXT,
]

/** Dynamic data kind allowing nesting */
export type NestableDataKind = DK.ARRAY | DK.DICTIONARY
/** Static data kinds (i.e. string, number, boolean, null) */
export type StaticDataKind =
  DK.BOOLEAN
  | DK.BLOB
  | DK.DATETIME
  | DK.FLOAT
  | DK.GEOPOINT
  | DK.INTEGER
  | DK.NULL
  | DK.RELATION
  | DK.TEXT

/**
 * Evaluation kinds
 */
export enum Eval {
  Required = 'r6d',
  Regex = 'r3x',
}

/**
 * Property name index signatures
 */
export const Sig = {
  Id: 'id',
  Name: 'name',
  Kind: 'kind',
  Created: 'created',
  Update: 'updated',
  Deleted: 'deleted',
  Value: 'value',
  Blueprint: 'blueprint',
  Model: 'model',
  Items: 'items',
  Cid: 'cid',
  Collections: 'collections',
  Documents: 'documents',
  Fields: 'fields',
  Subfields: 'subfields',
}

/**
 * Friendly-text/display-names of local names or
 *
 * TODO: i18n
 */
export const lbl = {

  /** Fields */
  [Sig.Id]: 'Unique ID',
  [Sig.Name]: 'Display Name',
  [Sig.Kind]: 'Kind',
  [Sig.Blueprint]: 'Blueprint',
  [Sig.Value]: 'Value',
  [Sig.Created]: 'Created Date',
  [Sig.Update]: 'Updated Date',
  [Sig.Deleted]: 'Deleted Date',
  [Sig.Collections]: 'Collections',
  [Sig.Model]: 'Model',
  [Sig.Documents]: 'Documents',
  [Sig.Fields]: 'Fields',
  [Sig.Subfields]: 'Subfields',


  /** Data Types */
  [DK.ARRAY]: 'Array',
  [DK.BOOLEAN]: 'Boolean',
  [DK.BLOB]: 'Bytes',
  [DK.DATETIME]: 'Date Time',
  [DK.FLOAT]: 'Float',
  [DK.GEOPOINT]: 'Geographical Point',
  [DK.INTEGER]: 'Integer',
  [DK.DICTIONARY]: 'Map',
  [DK.NULL]: 'Null',
  [DK.RELATION]: 'Relation',
  [DK.TEXT]: 'Text',

}

/**
 * Describes the initial configuration for the application controller
 */
export interface AppConfig {
  collections: Dictionary[]
}
export interface AppDocumentType extends Dictionary {
  id?: ID
  name?: string
  class?: Classification
  kind?: DK
}
export interface DocumentType_Field extends AppDocumentType {
  class: Classification.FIELD
  items?: DocumentType_Field['id'][]
  eval?: Eval | Eval[] | { [field: string]: Eval | Eval[] }
}
export interface DocumentType_Document extends AppDocumentType {
  class: Classification.DOCUMENT
  kind: DK.DOCUMENT | DK.COLLECTION
  fields?: DocumentType_Field[]
  rules?: any[]
  entries?: Record<
    DocumentType_Document['fields'][number]['id'],
    FieldType<DocumentType_Document['fields'][number]['kind']>
  >[]
}
export interface DocumentType_Collection extends AppDocumentType {
  class: Classification.COLLECTION | Classification.SUB_COLLECTION
  kind: DK.COLLECTION
  operations?: any[]
  documents?: DocumentType_Document[]
}

/**
 * Default App Collections Configuration
 */
const blueprints: DocumentType_Collection = {
  id: 'blueprints',
  name: 'Document Blueprints',
  class: Classification.COLLECTION,
  kind: DK.COLLECTION,
  operations: [],
  documents: sortBy([
    {
      id: Sig.Blueprint,
      readonly: true,
      name: 'Document Blueprints (system)',
      class: Classification.DOCUMENT,
      kind: DK.COLLECTION,
      rules: [],
      entries: [],
      fields: sortBy([
        {
          id: Sig.Id,
          readonly: true,
          name: lbl[Sig.Id],
          class: Classification.FIELD,
          kind: DK.TEXT
        }, {
          id: Sig.Name,
          readonly: true,
          name: lbl[Sig.Name],
          class: Classification.FIELD,
          kind: DK.TEXT,
        }, {
          id: Sig.Kind,
          readonly: true,
          name: lbl[Sig.Kind],
          class: Classification.FIELD,
          kind: DK.TEXT,
        }, {
          id: Sig.Created,
          readonly: true,
          name: lbl[Sig.Created],
          class: Classification.FIELD,
          kind: DK.DATETIME,
        }, {
          id: Sig.Update,
          readonly: true,
          name: lbl[Sig.Update],
          class: Classification.FIELD,
          kind: DK.DATETIME,
        }, {
          id: Sig.Deleted,
          readonly: true,
          name: lbl[Sig.Deleted],
          class: Classification.FIELD,
          kind: DK.DATETIME,
        },
      ], 'name', 'id')
    },

  ], 'name', 'id')
}

/**
 * The default application configuration object, can be
 * merged with a custom config to set overrides
 */
export const defaultAppConfig: AppConfig = {

  // Collections
  collections: [
    blueprints,
  ]
}