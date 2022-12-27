/**
 * @license
 * Copyright 2022 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  type ForwardedRef,
  type MutableRefObject,
  type RefCallback,
  type RefObject,
  useMemo,
  useRef,
} from 'react'

/**
 * Check if value is of type function similar to a ref callback
 */
export function isRefCallback<T>(val: ForwardedRef<T>): val is RefCallback<T> {
  return typeof val === 'function'
}

/**
 * Check if value is of mutable ref object
 */
export function isRefObject<T>(
  val: ForwardedRef<T>,
): val is MutableRefObject<T> {
  return Boolean(val) && 'current' in val
}

/**
 * Assign a React ref object, could be a RefCallback or RefObject
 */
export function assignRef<T>(ref: ForwardedRef<T>, value: T): T {
  if (isRefCallback(ref)) ref(value)
  else if (isRefObject(ref)) (ref as MutableRefObject<T>).current = value
  return value
}

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 */
export function mergeRefs<T>(...refs: ForwardedRef<T>[]): RefCallback<T> {
  return (value: T) => {
    for (const ref of refs) {
      assignRef(ref, value)
    }
    return value
  }
}

/**
 * Combines multiple RefCallback|RefObject into one.
 */
export function useRefForked<Instance>(
  refB: ForwardedRef<Instance>,
): [RefCallback<Instance>, RefObject<Instance>]
export function useRefForked<Instance>(
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
): [RefCallback<Instance>, RefObject<Instance>]
export function useRefForked<Instance>(
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
  refD: ForwardedRef<Instance>,
): [RefCallback<Instance>, RefObject<Instance>]
export function useRefForked<Instance>(
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
  refD: ForwardedRef<Instance>,
  refE: ForwardedRef<Instance>,
): [RefCallback<Instance>, RefObject<Instance>]
export function useRefForked<Instance>(
  refB: ForwardedRef<Instance>,
  refC?: ForwardedRef<Instance>,
  refD?: ForwardedRef<Instance>,
  refE?: ForwardedRef<Instance>,
): [RefCallback<Instance>, RefObject<Instance>] {
  const refObject = useRef<Instance>()
  const refCallback = useForkedRefs(refObject, refB, refC, refD, refE)
  return [refCallback, refObject]
}

export function useForkedRefs<Instance>(
  refA: ForwardedRef<Instance>,
  refB: ForwardedRef<Instance>,
): RefCallback<Instance> | null
export function useForkedRefs<Instance>(
  refA: ForwardedRef<Instance>,
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
): RefCallback<Instance> | null
export function useForkedRefs<Instance>(
  refA: ForwardedRef<Instance>,
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
  refD: ForwardedRef<Instance>,
): RefCallback<Instance> | null
export function useForkedRefs<Instance>(
  refA: ForwardedRef<Instance>,
  refB: ForwardedRef<Instance>,
  refC: ForwardedRef<Instance>,
  refD: ForwardedRef<Instance>,
  refE: ForwardedRef<Instance>,
): RefCallback<Instance> | null
export function useForkedRefs<Instance>(
  refA: ForwardedRef<Instance>,
  refB: ForwardedRef<Instance>,
  refC?: ForwardedRef<Instance>,
  refD?: ForwardedRef<Instance>,
  refE?: ForwardedRef<Instance>,
): RefCallback<Instance> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior.
   */
  return useMemo(() => {
    if (
      refA == null &&
      refB == null &&
      refC == null &&
      refD == null &&
      refE == null
    ) {
      return null
    }
    return (refValue) => {
      assignRef(refA, refValue)
      assignRef(refB, refValue)
      assignRef(refC, refValue)
      assignRef(refD, refValue)
      assignRef(refE, refValue)
    }
  }, [refA, refB, refC, refD, refE])
}

export default useRefForked
