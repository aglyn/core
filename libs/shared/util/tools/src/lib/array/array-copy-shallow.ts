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

import clone from 'lodash-es/clone'


/**
 * Shallow copy array like, shortcut for {@link _.clone}
 * @see _.clone
 * @param iterable - An iterable object to convert to an array
 */
export function arrayCopyShallow<T>(iterable: Array<T>): Array<T>
export function arrayCopyShallow<T>(iterable: Iterable<T>): Iterable<T>
export function arrayCopyShallow<T>(iterable: ArrayLike<T>): ArrayLike<T>
export function arrayCopyShallow<T>(iterable: Array<T> | ArrayLike<T> | Iterable<T>): Array<T> | ArrayLike<T> | Iterable<T> {
  return clone(iterable)
}
export default arrayCopyShallow
