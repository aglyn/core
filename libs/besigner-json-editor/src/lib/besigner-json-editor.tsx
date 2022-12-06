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

/* eslint-disable-next-line */
import dynamic from 'next/dynamic'
import type { JsonModalProps } from './json-modal'

const BesignerJsonModal = dynamic(
  async () => await import('./json-modal').then((mod) => mod.JsonModal),
  { ssr: false },
)

export interface BesignerJsonEditorProps extends JsonModalProps {}

export function BesignerJsonEditor(props: BesignerJsonEditorProps) {
  const { open, ...rest } = props
  return open ? <BesignerJsonModal open={open} {...rest} /> : null
}
BesignerJsonEditor.displayName = 'BesignerJsonEditor'

export default BesignerJsonEditor
