import { KeyValueDataModel } from '../common/types'

/**
 * PROP e.g. state/context property/variable item
 */
export enum PropType {
  String = 1
}

export type PropModel<T = any> = {
  readonly uuid: string
  type?: PropType
  value?: T
  metadata?: KeyValueDataModel
}

/**
 * IF {Array<CoreComponent['id']>} - Array of component IDs to deny or allow
 * IF {false} - None allowed or deny all
 */
export type ConstrainCompUuids = false | Array<CompModel['uuid']>
export type RelationConstraint = [type: AuthConstraint, uuids: ConstrainCompUuids]

export enum AuthConstraint {
  Allow = 0,
  Deny = 1
}

/**
 * COMP e.g. Elem type
 */
export type CompModel = {
  readonly uuid: string
  constrainParentComps?: RelationConstraint
  constrainChildrenComps?: RelationConstraint
  metadata?: KeyValueDataModel
}

/**
 * ELEM e.g. The COMP instance/rendered/used
 */
export type ElemModel = {
  readonly uuid: string
  compUuid?: CompModel['uuid']
  parentUuid?: ElemModel['uuid']
  childrenUuids?: Array<ElemModel['uuid']>
  metadata?: KeyValueDataModel
}

// /**
//  * CANVAS e.g. The rendered Elems
//  */
// export type CanvasModel = {
//   readonly uuid: string
//   elems: KeyValueDataModel<ElemModel>
// }

/**
 * INSTANCE e.g. The project/page/workshop data
 */
export type InstanceModel = {
  readonly uuid: string
  metadata: KeyValueDataModel
  // canvas: CanvasModel
  elems: KeyValueDataModel<ElemModel>
  comps: KeyValueDataModel<CompModel>
  props: KeyValueDataModel<PropModel>
}
