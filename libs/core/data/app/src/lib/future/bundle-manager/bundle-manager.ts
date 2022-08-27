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

import { _hasOwnProperty } from '@aglyn/shared-util-guards'
import { AglynEvent, emitter, lifecycleEvent } from '../emit-manager'
import { BundleId, BundleSchema } from './bundle'

export const bundles: Record<BundleId, BundleSchema> = {}

emitter.on(AglynEvent.BUNDLE_REGISTER, ({ bundle }) => {
  registerBundle(bundle)
})
emitter.on(AglynEvent.BUNDLE_UNREGISTER, ({ bundleId }) => {
  unregisterBundle(bundleId)
})

export function getBundle(bundleId: BundleId) {
  return bundles[bundleId]
}

export function hasBundle(bundleId: BundleId) {
  return bundleId && _hasOwnProperty(bundleId, bundles)
}

export function registerBundle(schema: BundleSchema) {
  const { bundleId } = schema
  lifecycleEvent(
    () => {
      bundles[bundleId] = schema
      for (const preset of schema.presets || []) {
        emitter.emit(AglynEvent.PRESET_REGISTER, { preset })
      }
    },
    {
      beforeEvent: AglynEvent.BUNDLE_REGISTERING,
      beforePayload: [{ schema }],
      afterEvent: AglynEvent.BUNDLE_REGISTERED,
      afterPayload: [{ schema }],
    },
  )
}

export function unregisterBundle(bundleId: BundleId) {
  const bundle = bundles[bundleId]
  lifecycleEvent(
    () => {
      if (!bundle) throw new Error(`No bundle exists with ID ${bundleId}`)

      for (const componentId of bundle.componentIds || []) {
        emitter.emit(AglynEvent.COMPONENT_UNREGISTER, { componentId, bundleId })
      }
      delete bundles[bundleId]
    },
    {
      beforeEvent: AglynEvent.BUNDLE_UNREGISTERING,
      beforePayload: [{ bundleId }],
      afterEvent: AglynEvent.BUNDLE_UNREGISTERED,
      afterPayload: [{ bundleId }],
    },
  )
}
