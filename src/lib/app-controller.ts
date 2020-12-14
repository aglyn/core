import { Collection } from './collection'
import { AppConfig, defaultAppConfig } from './config'
import { Document } from './document'
import { ID } from './types'


export class AppController {

  /**
   * Singleton class instance
   *
   * @private
   * @static
   * @type {AppController}
   * @memberof AppController
   */
  private static _instance: AppController

  /**
   * Application configuration
   *
   * @private
   * @type {AppConfig}
   * @memberof AppController
   */
  private readonly _config: AppConfig

  /**
   * Create a new singleton instance only if it's undefined
   *
   * @private
   * @static
   * @throws
   * @param {AppConfig} [config]
   * @returns {AppController}
   * @memberof AppController
   */
  private static _createInstance(config?: AppConfig): AppController {
    return this._instance ??= new this(config)
  }

  /**
   * Initialize the app controller for the first time
   *
   * @static
   * @param {AppConfig} [config]
   * @returns {AppController}
   * @memberof AppController
   */
  static initialize(config?: AppConfig): AppController {
    return this._instance ?? this._createInstance(config)
  }

  /**
   * Get the current living singleton instance (must already be initialized!)
   *
   * @static
   * @throws
   * @returns {AppController}
   * @memberof AppController
   */
  static getInstance(): AppController {
    if (!this._instance) { throw new Error('App controller has not been initialized!') }
    return this._instance
  }

  /**
   * Living data
   *
   * @private
   * @type {Collection<Collection<Document>>}
   * @memberof AppController
   */
  private _collections: Collection<Collection<Document>>


  private constructor(config?: AppConfig) {
    this._config = { ...defaultAppConfig, ...config }
    this._collections = new Collection<Collection<Document>>({
      items: this._config.collections
    })
    this._collections.model = Collection
    this._collections.init()
  }

  getCollection(id: ID): Collection<Document> {
    return this._collections.getItem(id)
  }

  addCollection(v: Collection<Document>): this {
    this._collections.addItem(v)
    return this
  }

  deleteCollection(id: ID): this {
    this._collections.deleteItem(this.getCollection(id))
    return this
  }

  getCollections(): Collection<Collection<Document>> {
    return this._collections
  }

}

console.log('app controller', AppController)