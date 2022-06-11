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

import {getApp} from '@aglyn/core-data-framework'
import type {BesignerComponentProps} from '@aglyn/core-feature-besigner'
import {useBesignerAppContext} from '@aglyn/core-feature-besigner'
import {HAS_BROWSER} from '@aglyn/shared-data-enums'
import {LOADING_OVERLAY_ELEMENT, useLoading} from '@aglyn/shared-ui-jsx'
import {encode} from '@msgpack/msgpack'
import {Button} from '@mui/material'
import dynamic from 'next/dynamic'
import {useCallback, useEffect} from 'react'
import '../../../../constants/app-setup'


const AglynBesigner = dynamic<BesignerComponentProps>(
  () => import('@aglyn/core-feature-besigner').then((mod) => mod.BesignerComponent),
  {ssr: false, loading: () => LOADING_OVERLAY_ELEMENT},
)

export interface BesignerPageProps {}

function BesignerPage(props: BesignerPageProps) {
  const app = useBesignerAppContext()
  const {queueLoading} = useLoading()

  useEffect(() => {
    if (HAS_BROWSER()) {
      console.log('page:/besigner app', getApp())
    }
  }, [])

  const handleClick = useCallback(async () => {
    const dequeueLoading = queueLoading()
    const elements = app.canvas.denormalizedElements
    console.log('elements pre-encode', elements)
    const encoded = encode(elements)
    console.log('elements encoded', encoded)
    dequeueLoading()
  }, [app.canvas.denormalizedElements, queueLoading])

  return (
    <>
      <Button
        onClick={handleClick}
      >
        Save
      </Button>
      <AglynBesigner
        sx={{flexGrow: 1, position: 'unset'}}
      />
    </>
  )
}

BesignerPage.displayName = 'BesignerPage'

export {BesignerPage}
export default BesignerPage
