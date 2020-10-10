/**
 * Data structure model for key value pairs
 */
export type KeyValueDataModel<T = string> = {
  keys: Array<keyof KeyValueDataModel['byKey']>
  byKey: {
    [key: string]: T
  }
}
