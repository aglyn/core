/**
 * @license
 * Copyright 2026 Aglyn LLC
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
'use client'

import { forwardRef } from 'react'
import { LoadingProviderComponent } from '../contexts/loading.context'
import { LoadingModal } from './loading-modal'
import type { LoadingLayoutComponentProps } from './loading-layout.component'

/**
 * App Router variant of {@link LoadingLayoutComponent}. The Pages Router
 * version wires a `RouterLoading` that shows the modal on `router.events`
 * transitions, but that API does not exist in the App Router (and calling
 * `useRouter()` from `next/router` there throws "NextRouter was not mounted").
 * App Router route transitions are covered by Suspense / `loading.tsx`
 * boundaries instead, so this variant drops the router-events wiring while
 * keeping the {@link LoadingProviderComponent} context and {@link LoadingModal}
 * so imperative `useLoading().queueLoading()` calls still render a modal.
 */
const LoadingLayoutAppComponent = forwardRef<any, LoadingLayoutComponentProps>(
  (props, ref) => {
    const { children, ...rest } = props

    return (
      <LoadingProviderComponent>
        <LoadingModal ref={ref} {...rest}>
          {children}
        </LoadingModal>
      </LoadingProviderComponent>
    )
  },
)
LoadingLayoutAppComponent.displayName = 'LoadingLayoutAppComponent'
LoadingLayoutAppComponent.aglyn = true

export { LoadingLayoutAppComponent }
export default LoadingLayoutAppComponent
