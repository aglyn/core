import { Collection } from '../models/collection'
import { Document } from '../models/document'
// import { Normalized } from './models/normalized'
import { ID } from '../types/data'

import { Data, n, Sig } from './const'
import { s } from './utils'

const fieldsColl = {
  id: 'fields',
  name: 'Fields Collection',
  items: [
    {
      id: Sig.ID,
      name: n.displayName[Sig.ID],
      kind: Data.TEXT
    },
    {
      id: Sig.NAME,
      name: n.displayName[Sig.NAME],
      kind: Data.TEXT,
    },
    {
      id: Sig.KIND,
      name: n.displayName[Sig.KIND],
      kind: Data.TEXT,
    },
    {
      id: Sig.CREATED,
      name: n.displayName[Sig.CREATED],
      kind: Data.TEXT,
    },
    {
      id: Sig.UPDATED,
      name: n.displayName[Sig.UPDATED],
      kind: Data.TEXT,
    },
    {
      id: Sig.DELETED,
      name: n.displayName[Sig.DELETED],
      kind: Data.TEXT,
    },
  ].map(i => new Document(i).init())
}

const docsColl = {
  id: 'documents',
  name: 'Documents Collection',
  items: [
    {
      id: Sig.MODEL,
      name: 'Default Document Fields',
      cid: Sig.FIELDS,
      items: Array.from(fieldsColl.items).map(i => s(i.getId()))
    },
  ].map(i => new Document(i).init())
}

export class AppController {

  /** singleton */
  private static instance: AppController
  public static getInstance() {
    if (!this.instance) { this.instance = new this() }
    return this.instance
  }

  private collections: Collection<Collection<Document>>

  private constructor() {
    this.collections = new Collection<Collection<Document>>()
    this.collections.model = Collection
    this.addCollection(this.collections.createItem(fieldsColl))
    this.addCollection(this.collections.createItem(docsColl))
  }

  getCollection(id: ID): Collection<Document> {
    return this.collections.getItem(id)
  }

  addCollection(v: Collection<Document>): this {
    this.collections.addItem(v)
    return this
  }

  deleteCollection(id: ID): this {
    this.collections.deleteItem(this.getCollection(id))
    return this
  }

  getCollections(): Collection<Collection<Document>> {
    return this.collections
  }

  toJSON() {
    return this.collections
  }

}

console.log('app controller', AppController.getInstance())