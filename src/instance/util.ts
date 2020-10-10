import { KeyValueDataModel } from '../common/types'
import { createUuid, deleteProperty, isNumber, removeFromArray, reorderArray } from '../common/util'
import { AuthConstraint, CompModel, ElemModel, InstanceModel, PropModel } from './types'


/**
 * Create empty data structure object for key value pairs
 * @returns {KeyValueDataModel}
 */
export function createKeyValueData<T>(): KeyValueDataModel<T> {
  return {
    keys: [],
    byKey: {},
  }
}

/**
 * Removes an item from an existing key value data structure object
 * @param {string} key
 * @param {KeyValueDataModel<T>} data
 * @returns {KeyValueDataModel<T>}
 */
export function deleteItemFromKeyValueData<T>(key: string, data: KeyValueDataModel<T>): KeyValueDataModel<T> {
  data.keys = removeFromArray(key, data.keys)
  deleteProperty(data.byKey, key)
  return data
}

/**
 * Sets an item in an existing key value data structure object.
 * @param {[key: string, value: T]} item
 * @param {KeyValueDataModel<T>} data
 * @param {number} index
 * @returns {KeyValueDataModel<T>}
 */
export function setItemInKeyValueData<T>(
  item: [key: string, value: any],
  data: KeyValueDataModel<T>,
  index?: number,
): KeyValueDataModel<T> {
  const [key, value] = item
  const currentIndex = data.keys.indexOf(key)
  const isUpdate = currentIndex !== -1

  data.byKey[key] = value

  if (!isUpdate) {
    data.keys.push(key)
  } else if (isNumber(index) && currentIndex !== index) {
    reorderArray(data.keys, currentIndex, index)
  }

  return data
}

/**
 * Create a COMP object
 * @param {Partial<CompModel>} fields
 * @returns {CompModel}
 */
export function createComp(fields?: Partial<CompModel>): CompModel {
  return Object.assign({
    uuid: createUuid(),
  }, fields)
}

/**
 * Create a ELEM object
 * @param {Partial<ElemModel>} fields
 * @returns {ElemModel}
 */
export function createElem(fields?: Partial<ElemModel>): ElemModel {
  return Object.assign({
    uuid: createUuid(),
  }, fields)
}

/**
 * Create a PROP object
 * @param {Partial<PropModel>} fields
 * @returns {PropModel}
 */
export function createProp(fields?: Partial<PropModel>): PropModel {
  return Object.assign({
    uuid: createUuid(),
  }, fields)
}

// /**
//  * Create a CANVAS object
//  * @param {Partial<CanvasModel>} fields
//  * @returns {CanvasModel}
//  */
// export function createCanvas(fields?: Partial<CanvasModel>): CanvasModel {
//   return Object.assign({
//     uuid: createUuid(),
//     elems: createKeyValueData(),
//   }, fields)
// }

/**
 * Create a INSTANCE object
 * @param {Partial<InstanceModel>} fields
 * @returns {InstanceModel}
 */
export function createInstance(fields?: Partial<InstanceModel>): InstanceModel {
  return Object.assign({
    uuid: createUuid(),
    metadata: createKeyValueData(),
    elems: createKeyValueData(),
    comps: createKeyValueData(),
    props: createKeyValueData(),
    // canvas: createCanvas(),
  }, fields)
}

/**
 * Check if the relationship of the Elem is allowed within the parent Elem
 * @param {CompModel} comp The Elem Comp object
 * @param {CompModel} parentComp the Elem parent Comp object
 * @returns {boolean}
 */
export function isElemRelationAllowed(comp: CompModel, parentComp: CompModel): boolean {
  const {uuid: childUuid, constrainParentComps} = comp
  const {uuid: parentUuid, constrainChildrenComps} = parentComp

  function checkConstraint(checkUuid, constraint) {
    let [type, uuids] = constraint

    // Elem does not allow any
    if (!uuids) {
      return false
    }

    // Check if the uuid is equal to or is listed in an array of Uuids
    let isUuidListed = Array.isArray(uuids)
      ? uuids.some(id => id === checkUuid)
      : checkUuid === uuids

    // Elem is not allowed
    if (type === AuthConstraint.Allow && !isUuidListed) {
      return false
    }

    // Elem is denying
    else if (type === AuthConstraint.Deny && isUuidListed) {
      return false
    }

    return true
  }

  // Will Elem reject parent?
  if (constrainParentComps && !checkConstraint(parentUuid, constrainParentComps)) {
    return false
  }

  // Will parent reject Elem?
  else if (constrainChildrenComps && !checkConstraint(childUuid, constrainParentComps)) {
    return false
  }

  return true
}
