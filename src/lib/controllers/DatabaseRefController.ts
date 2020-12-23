import { PKey, Ref, Schema } from '../interfaces/dod'

import { BaseRefController } from './BaseRefController'


export class DatabaseRefController<Ss extends Schema.CollectionModels> extends BaseRefController<Ss, Ref.DatabaseCollections<Ss>> {

  constructor(id: PKey, schemas: Ss, instances?: Ref.DatabaseCollections<Ss>) {
    super({ id, schema: schemas }, { ...instances })
  }

  public static from<Ss extends Schema.CollectionModels>(id: PKey, schemas: Ss, collections: Ref.DatabaseCollections<Ss>) {
    return new this(id, schemas, collections)
  }

  /**
   * Initialize the instance, should be called immediately after
   * creating the object
   *
   * @public
   * @memberof CollectionRefController
   */
  public init(): this {
    this.preInit && this.preInit()
    this.initDocuments()
    this.onInit && this.onInit()
    return this
  }

  protected initDocuments() {
    console.debug('initDocuments', this.getId(), this.getSchema(), this.getCollections())
    // Ensure if items are an object we ensure they are a document instance
    // if (!(this.documents instanceof Normalized)) {
    //   this.setDocuments(new Normalized(this.documents))
    // }
    // if (this.documents instanceof Normalized) {
    //   this.documents.toArray().forEach(doc => {
    //     if (!(doc instanceof DocumentRefController)) {
    //       this.setDocument(
    //         doc.id, this.createDocument(doc).init()
    //       )
    //     }
    //   })
    // }
  }

  public getSchemaById<K extends keyof Ss>(id: K): Ss[K] {
    return super.getSchema()[id]
  }

  public getCollections(): Ref.DatabaseCollections<Ss> {
    return this.model
  }

  public setCollections(value: Ref.DatabaseCollections<Ss>): this {
    this.model = value
    return this
  }

}