import { AppControllerConfig } from './lib/app-controller'
import { Collection } from './lib/collection'
import { DK, lbl, Sig } from './lib/config'
import { Document } from './lib/document'
import { Field, FieldModel } from './lib/field'
import { createUid } from './lib/uid'
import { sortBy } from './lib/utils'

/**
 * Blueprint field
 */
const blueprintFields: FieldModel[] = sortBy([
  new Field({
    [Sig.Id]: Sig.Name,
    [Sig.Kind]: DK.TEXT,
    [Sig.Name]: lbl[Sig.Name],
  }),
  new Field({
    [Sig.Id]: Sig.Kind,
    [Sig.Kind]: DK.TEXT,
    [Sig.Name]: lbl[Sig.Id],
  }),
  new Field({
    [Sig.Id]: Sig.Created,
    [Sig.Kind]: DK.DATETIME,
    [Sig.Name]: lbl[Sig.Created],
  }),
  new Field({
    [Sig.Id]: Sig.Updated,
    [Sig.Kind]: DK.DATETIME,
    [Sig.Name]: lbl[Sig.Updated]
  }),
  new Field({
    [Sig.Id]: Sig.Deleted,
    [Sig.Kind]: DK.DATETIME,
    [Sig.Name]: lbl[Sig.Deleted]
  }),
].map(i => i.init()), 'data.name', 'data.id')

// Need? Maybe not but in case of laziness
// new Field({
//   [Sig.Id]: Sig.Id,
//   [Sig.Kind]: DK.TEXT,
//   [Sig.Name]: lbl[Sig.Id],
// }),

/**
 * Blueprint model document
 */
const blueprintModel = new Document({
  [Sig.Id]: Sig.Model,
  [Sig.Fields]: sortBy([
    new Field({
      [Sig.Id]: Sig.Name,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Name],
      [Sig.Value]: 'system blueprint - (sample)'
    }),
    new Field({
      [Sig.Id]: Sig.Kind,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Kind],
      [Sig.Value]: DK.BLUEPRINT
    }),
    new Field({
      [Sig.Id]: Sig.Fields,
      [Sig.Kind]: DK.ARRAY,
      [Sig.Name]: lbl[Sig.Fields],
      [Sig.Value]: Array.from(blueprintFields)
    }),
    new Field({
      [Sig.Id]: Sig.Entries,
      [Sig.Kind]: DK.ARRAY,
      [Sig.Name]: lbl[Sig.Entries],
      [Sig.Value]: [
        new Field({
          [Sig.Id]: createUid(),
          [Sig.Fields]: Array.from(blueprintFields).map((field: FieldModel) => {
            const sampleData = {
              [Sig.Name]: 'blueprint entry - (sample)',
              [Sig.Kind]: DK.ENTRY,
              [Sig.Created]: new Date().getMilliseconds(),
            }
            const _field = new Field({
              [Sig.Id]: field.id,
              [Sig.Value]: sampleData[field.id],
            }).init()
            return _field
          })
        }).init()
      ]
    }),
  ].map(i => i.init()), 'data.name', 'data.id'),
}).init()


/**
 * Blueprints collection document
 */
const blueprints = new Document({

  [Sig.Id]: 'blueprints',

  [Sig.Fields]: sortBy([
    new Field({
      [Sig.Id]: Sig.Name,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Name],
      [Sig.Value]: 'Document Blueprints',
    }),
    new Field({
      [Sig.Id]: Sig.Kind,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Kind],
      [Sig.Value]: DK.COLLECTION
    }),
    new Field({
      [Sig.Id]: Sig.Model,
      [Sig.Kind]: DK.DOCUMENT,
      [Sig.Name]: lbl[Sig.Model],
      [Sig.Value]: blueprintModel
    }),
    new Field({
      [Sig.Id]: Sig.Value,
      [Sig.Kind]: DK.COLLECTION,
      [Sig.Name]: lbl[Sig.Value],
      [Sig.Value]: new Collection({
        [Sig.Id]: 'blueprints',
        [Sig.Documents]: [blueprintModel]
      }).init()
    }),
  ].map(i => i.init()), 'data.name', 'data.id'),

}).init()

/**
 * App config data structure
 */
const structure = new Document({

  [Sig.Id]: 'structure',

  [Sig.Fields]: sortBy([
    new Field({
      [Sig.Id]: Sig.Name,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Name],
      [Sig.Value]: 'Data Structure',
    }),
    new Field({
      [Sig.Id]: Sig.Kind,
      [Sig.Kind]: DK.TEXT,
      [Sig.Name]: lbl[Sig.Kind],
      [Sig.Value]: DK.DOCUMENT
    }),
  ].map(i => i.init()), 'data.name', 'data.id'),

  [Sig.Subcollections]: [blueprints]

}).init()

/**
 * The default application configuration object, can be
 * merged with a custom config to set overrides
 */
export const defaultAppConfig: AppControllerConfig = {

  structure

}