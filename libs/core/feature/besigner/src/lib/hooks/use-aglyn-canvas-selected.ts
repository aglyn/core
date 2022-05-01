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
  type BesignerCanvasSelectedElement,
  type BesignerCanvasState,
  type IBesignerAppController,
  setBesignerCanvasSelected,
} from '@aglyn/core-data-besigner'
import {useAglynAppContext} from '@aglyn/core-feature-renderer'
import {_isFnT} from '@aglyn/shared-util-guards'
import {useCallback, useEffect, useState} from 'react'


export function useAglynCanvasSelected(): [
  value: BesignerCanvasSelectedElement | undefined,
  setValue: (
    selected: BesignerCanvasSelectedElement | ((
      prev: BesignerCanvasSelectedElement,
      canvas: BesignerCanvasState,
    ) => BesignerCanvasSelectedElement),
  ) => void
] {
  const app = useAglynAppContext() as IBesignerAppController
  const [value, setValue] = useState<BesignerCanvasSelectedElement | undefined>(undefined)
  const setSelected = useAglynCanvasSetSelected()

  useEffect(() => {
    const subscription = app.besigner?.__store__.canvas?.subscribe((canvas) => {
      setValue(canvas?.selected)
    })
    return () => subscription.unsubscribe()
  }, [app])


  return [value, setSelected]
}

export default useAglynCanvasSelected

export function useAglynCanvasSetSelected(): (
  selected: BesignerCanvasSelectedElement | ((
    prev: BesignerCanvasSelectedElement,
    canvas: BesignerCanvasState,
  ) => BesignerCanvasSelectedElement),
) => void {
  const app = useAglynAppContext() as IBesignerAppController
  return useCallback((
    selected: BesignerCanvasSelectedElement | ((
      prev: BesignerCanvasSelectedElement,
      canvas: BesignerCanvasState,
    ) => BesignerCanvasSelectedElement),
  ) => {
    setBesignerCanvasSelected(app, {
      selected: (prev, canvas) => _isFnT(selected) ? selected(prev, canvas) : selected,
    })
  }, [app])
}
