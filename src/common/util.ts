export function isTypeUndefined(val: any): val is undefined {
  return (typeof val === 'undefined')
}

export function isTypeBigInt(val: any): val is bigint {
  return typeof val === 'bigint'
}

export function isTypeNumber(val: any): val is number {
  return typeof val === 'number'
}

export function isTypeSym(val: any): val is symbol {
  return typeof val === 'symbol'
}

export function isTypeFunc(val: any): val is Function {
  return typeof val === 'function'
}

export function isTypeObject(val: any): val is Function {
  return typeof val === 'object'
}

export function isTypeString(val: any): val is string {
  return typeof val === 'string'
}

export function isTypeBoolean(val: any): val is boolean {
  return typeof val === 'boolean'
}

export function isString(val: any): val is string {
  return isTypeString(val)
}

export function isPrimitive(
  val: any,
  includeUndefined: boolean = true,
): val is symbol | bigint | number | object | string | Function | undefined {
  return Boolean(
    isTypeSym(val)
    || isTypeBigInt(val)
    || isTypeNumber(val)
    || isTypeObject(val)
    || isTypeBoolean(val)
    || isTypeString(val)
    || isTypeFunc(val)
    || (includeUndefined && isTypeUndefined(val)),
  )
}

function isAnyUndefined(val: any, typed?: boolean): val is undefined {
  const anyUndefined = Boolean(val === undefined)
  return typed ? isTypeUndefined(val) && anyUndefined : anyUndefined
}

export function isUndefined(
  val: any, considerEmptyStrUndef: boolean = true, typed?: boolean,
): val is undefined {
  return considerEmptyStrUndef ? isAnyUndefined(val, typed) : !isTypeString(val) && isAnyUndefined(
    val, typed)
}

export function isNull(val: any): val is null {
  return Boolean(val === null)
}

export function isNullOrUndefined<T extends null | undefined>(val: any): val is T {
  return isNull(val) || isUndefined(val)
}

export function isObject(val: any): val is Object {
  return !isNullOrUndefined(val) && isTypeObject(val) && !isArray(val)
}

export function isAnyObject(val: any): val is Object {
  return isTypeObject(val)
}

export function isBuffer(val: any): val is Buffer {
  return isAnyObject(val) && isAnyObject(val.constructor) && 'isBuffer' in val.constructor &&
    isTypeFunc((val.constructor as any).isBuffer) && (val.constructor as any).isBuffer(val)
}

export function isArray(val: any): val is Array<any> {
  return Array.isArray(val)
}

export function getLength<T>(val: Iterable<T> | ArrayLike<T>): number {
  return isString(val) ? trimString(val).length : isArray(val) ? val.length : 0
}

export function hasLength<T, U extends Iterable<T> | ArrayLike<T> | number>(
  val: U,
  equalTo?: number | undefined,
  lessThan?: number | undefined,
  moreThan?: number | undefined,
  and?: true | undefined,
  also?: ((length: number, value?: U) => boolean) | undefined,
): boolean {
  const immutable = isNumber(val) ? toNumber(val) : copy(val as Iterable<T> | ArrayLike<T>)
  const len: number = isNumber(val) ? immutable : getLength(immutable)
  const e = equalTo
  const l = lessThan
  const m = moreThan
  const et = isNumber(e)
  const lt = isNumber(l)
  const mt = isNumber(m)
  const func = isTypeFunc(also) ? also : false
  const noOpt = !et && !lt && !mt
  const chkFunc = (firstCheck: boolean): boolean => {
    if (func) return and ? firstCheck && func(len, immutable) : firstCheck || func(len, immutable)
    return firstCheck
  }
  const chkOpt = (equal: boolean, less: boolean, more: boolean, chk: boolean): boolean => {
    return (et === equal && lt === less && mt === more && chkFunc(chk))
  }

  return Boolean(
    noOpt
      ? chkFunc(isPosNumber(len))
      : chkOpt(true, false, false, (len === e))
      || chkOpt(false, true, false, (len < l))
      || chkOpt(false, false, true, (len > m))
      || chkOpt(false, true, true, (and ? (len < l && len > m) : (len < l || len > m)))
      || chkOpt(true, true, false, (and ? (len === e && len < l) : (len === e || len < l)))
      || chkOpt(true, false, true, (and ? (len === e && len > m) : (len === e || len > m)))
      || chkOpt(
        true, true, true,
        (and ? (len === e && len < l && len > m) : (len === e || len < l || len > m)),
      ),
  )
}

export function isEmptyArray<T>(val: any): val is ArrayLike<T> & typeof val['length'] extends 0
  ? true : false {
  return isArray(val) && !hasLength(val)
}

export function isEmptyString<T>(val: any): val is string & typeof val['length'] extends 0 ? true
  : false {
  return isTypeString(val) && hasLength(val)
}

export function isEmpty<T>(val: any): val is (ArrayLike<T> | string) & typeof val['length'] extends 0
  ? true : false {
  return Boolean(!isEmptyString(val) || !isEmptyArray(val))
}

export function isNumber<T extends number>(
  val: any, parse?: boolean, radix?: number, typed?: boolean): val is T {
  return typed ? isTypeNumber(val) : Boolean(toNumber(val, parse, radix, false))
}

export function isNegNumber<T extends number>(
  val: any, parse?: boolean, radix?: number): val is T & boolean {
  return Boolean(toNumber(val, parse, radix, 0) < 0)
}

export function isPosNumber<T extends number>(
  val: any, parse?: boolean, radix?: number): val is T & boolean {
  return Boolean(toNumber(val, parse, radix, 0) > 0)
}

export function isZero<T extends 0>(val: any, parse?: boolean, radix?: number): val is T {
  return Boolean(toNumber(val, parse, radix, false) === 0)
}

export function isOneOf<T, U>(
  val: T, possible: Array<U>,
): boolean { // TODO: Fix type check to check for `T is X`
  if ((!isArray(possible) && !isString(possible)) || !hasLength(possible)) return false
  const _checks = ensureArray(possible, [possible])
  return _checks.some(i => val === i)
}

export function ensureArray(value: any, otherwise?: any[]): Array<any> {
  return isArray(value) ? value : otherwise ?? []
}

export function ensureObject(value: any, otherwise?: object): object {
  return isObject(value) ? value : otherwise ?? {}
}

/**
 * Set a nested property within an object literal
 *
 * EXAMPLE:
 * const obj = {'a': {'prop': {'that': 'exists'}}};
 * setNestedProperty(obj, 'a.very.deep.prop', 'value')
 *
 * @see getNestedProperty
 *
 * @param obj {object}
 * @param path {string}
 * @param val {any}
 */
export function setNestedProperty(obj: object, path: string, val: any) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const lastObj = keys.reduce((obj, key) =>
    obj[key] = obj[key] || {}, obj,
  )
  lastObj[lastKey] = val
}

/**
 * Get a nested property within an object literal
 *
 * EXAMPLE:
 * const obj = {'a': {'prop': {'that': 'exists'}}};
 * getNestedProperty(obj, 'a.very.deep.prop', 'value')
 *
 * @see setNestedProperty
 *
 * @param obj {object}
 * @param path {string}
 */
export function getNestedProperty(obj: object, path: string): any {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const lastObj = keys.reduce((obj, key) =>
    obj[key] = obj[key] || {}, obj,
  )
  return lastObj[lastKey]
}

export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  if (!isObject(obj)) return undefined
  return obj[key]
}

export function copyObject<T>(obj: T): T {
  return copy(isObject(obj) ? obj as Object : obj as unknown)
}

export function arrayToObjectLiteral(...arr: any[]) {
  return Object.assign({}, ...arr.map(([key, val]) => ({[key]: val})))
}

export function getAllObjectKeys<T extends object, K extends keyof T>(obj: T): K[] {
  return (
    typeof Object.getOwnPropertySymbols === 'function'
      ? Object.keys(obj).concat(Object.getOwnPropertySymbols(obj) as any)
      /* istanbul ignore next */
      : Object.keys(obj)
  ) as K[]
}

export function reduceObject<T extends object, K extends keyof T>(
  target: T, reducerCallback: (val: T[K], key?: K, original?: T) => T[K],
): T {
  if (isUndefined(reducerCallback)) return target
  const _target: T = copyObject(target)
  const original: T = copyObject(target)

  return getAllObjectKeys(_target).reduce((result, key) => {
    result[key as string] = reducerCallback(_target[key] as T[K], key as K, original)
    return result
  }, {}) as T
}

export function mapObject<T extends object, K extends keyof T, U>(
  target: T, mapCallback: (val: [K, T[K]], index?: number, array?: T[]) => [K, U],
): T | any {
  if (!isTypeFunc(mapCallback)) return target
  return Object.fromEntries(
    Object
      .entries(copyObject(target))
      .map((...args) => {
        return (mapCallback as any)(...args) || undefined
      })
      .filter(i => i !== undefined),
  )
}

export function filterObject(target, callback) {
  return mapObject(target, ([k, v], ...args) => {
    if (isTypeFunc(callback) && callback([k, v], ...args) === true) {
      return [k, v]
    }
    return
  })
}

export function updateObject<T>(target: T, source: T): T {
  // Encapsulate the idea of passing a new object as the first parameter
  // to Object.assign to ensure we correctly copy data instead of mutating
  return Object.assign({}, target, source)
}

export function deleteProperty<T, K extends keyof T>(obj: Readonly<T>, key: K, options?: {copy: boolean}): T {
  const opts = {copy: true, ...options}
  const newObj = opts.copy ? copyObject(obj) : obj
  delete newObj[key]
  return newObj
}

export function toArray<T, U, F extends (v: T, k: number) => U = undefined>(
  iterable: Iterable<T> | ArrayLike<T>, mapfn?: (v: T, k: number) => U, thisArg?: any,
): F extends undefined ? Array<T> : Array<U> {
  return Array.from(iterable, mapfn, thisArg) as F extends undefined ? Array<T> : Array<U>
}

export function copyArray<T, U, F extends (v: T, k: number) => U = undefined>(
  iterable: Iterable<T> | ArrayLike<T>, mapfn?: F, thisArg?: any,
): F extends undefined ? Array<T> : Array<U> {
  return toArray(iterable, mapfn, thisArg)
}

export function updateArray<T>(oldArray: Array<T>, newArray: Array<T> | object): Array<T> {
  return Object.assign([], oldArray, newArray)
}

type MutatedArrayResponse<T> = Record<'items' | 'deleted' | 'added', Array<T>>
export function mutateArray<T>(
  index: number | any,
  array: Array<T>,
  items?: T | Array<T>,
  options?: {replace?: boolean, copy?: boolean},
): MutatedArrayResponse<T> {
  const {replace, copy} = {replace: true, copy: false, ...options}
  const _array = copy ? copyArray(array) : array
  const _items = ensureArray(items, items ? [items] : [])
  const deleteCount = (replace ? getLength(_items) : 0)
  const deleted = _array.splice(index, deleteCount, ..._items)

  return {items: _array, deleted, added: _items}
}

export function addAtIndex<T>(index: number, array: Array<T>, items: T | Array<T>): MutatedArrayResponse<T> {
  return mutateArray(index, array, items, {replace: false})
}

export function updateAtIndex<T>(index: number | any, array: Array<T>, item: T): MutatedArrayResponse<T> {
  return mutateArray(index, array, item)
}

export function removeAtIndex<T>(index: number, array: Array<T>): MutatedArrayResponse<T> {
  return mutateArray(index, array)
}

export function removeFromArray<T>(item: T, array: Array<T>): Array<T> {
  return ensureArray(array).filter(i => i !== item)
}

export function reorderArray<K extends number & keyof T, T extends Array<U>, U>(
  array: T, currentIndex: K | any, newIndex: K | any,
): T {
  const arr = mutateArray(currentIndex, array)
  return addAtIndex(newIndex, arr.items, arr.deleted).items as T
}

export function toString<T>(val: T): string {
  return String(val)
}

export function trimString<T>(val: T): string {
  return toString(val).trim()
}

export function capitalize<T extends string>(val: T): T {
  if (!isString(val) || !hasLength(val)) return val
  return (toString(val).charAt(0).toUpperCase() + toString(val).slice(1)) as T
}

export function capitalizeTitle<T extends string>(val: T): T {
  return toString(val).split(' ').map(i => capitalize(i)).join(' ') as T
}

export function parseNumber<T>(val: T, parse?: boolean, radix?: number): number {
  return parse ? parseInt(toString(val), radix) : Number(val)
}

export function toNumber<T>(val: any, parse?: boolean, radix?: number, allElse?: T): number | T {
  const parsed = parseNumber(val, parse, radix)
  return isNaN(parsed) ? allElse : parsed
}

/**
 * Generate a random ID string
 *
 * Math.random should be unique because of its seeding algorithm.
 * Convert it to base 36 (numbers + letters) and grab the first 9 characters
 * after the decimal.
 *
 * @param config {RandomIdConfig}
 *
 * @return {string}
 */
export default function createRandomId(config?: RandomIdConfig): string {
  const {prefix, radix, minLength, maxLength} = config || {}
  const rad = isNumber(radix) ? parseNumber(radix) : 36
  const min = isNumber(minLength) ? parseNumber(minLength) : 2
  const max = isNumber(maxLength) ? parseNumber(maxLength) : 9

  const id = Math
    .random()
    .toString(rad)
    .substr(min, max)

  return `${prefix || ''}${id}`
}

export type RandomIdConfig = {
  prefix?: string
  radix?: number
  minLength?: number
  maxLength?: number
}

export { v4 as createUuid } from 'uuid'

/**
 * =================================================================================================
 * CHERRY PICK FROM: https://github.com/kolodny/immutability-helper/blob/master/index.ts
 * =================================================================================================
 */
export function copy<T, U, K, V, X>(
  object: T extends U[]
    ? U[]
    : T extends Map<K, V>
      ? Map<K, V>
      : T extends Set<X>
        ? Set<X>
        : T extends object
          ? T
          : any,
) {
  const ObjectToString = Object.prototype.toString
  function type<T>(obj: T) {
    return (ObjectToString.call(obj) as string).slice(8, -1)
  }
  const assign = Object.assign || (<T, S>(target: T, source: S) => {
    getAllObjectKeys(source as {}).forEach(key => {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key]
      }
    })
    return target as T & S
  })

  return Array.isArray(object)
    ? assign(object.constructor(object.length), object)
    : (type(object) === 'Map')
      ? new Map(object as Map<K, V>)
      : (type(object) === 'Set')
        ? new Set(object as Set<X>)
        : (object && typeof object === 'object')
          ? assign(Object.create(Object.getPrototypeOf(object)), object) as T
          : object as T
}
