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

// import {componentMapper as muiComponentMapper} from '@data-driven-forms/mui-component-mapper'
import {type ComponentMapper, componentTypes} from '@data-driven-forms/react-form-renderer'
import dynamic from 'next/dynamic'


const FieldIconSelect = dynamic(
  () => import('./components/field-icon-select').then((mod) => mod.default),
  {ssr: false},
)
const Select = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/select').then((mod) => mod.default),
  {ssr: false},
)
const Switch = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/switch').then((mod) => mod.default),
  {ssr: false},
)
const TextField = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/text-field').then((mod) => mod.default),
  {ssr: false},
)
const Textarea = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/textarea').then((mod) => mod.default),
  {ssr: false},
)
const PlainText = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/plain-text').then((mod) => mod.default),
  {ssr: false},
)
const Slider = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/slider').then((mod) => mod.default),
  {ssr: false},
)
const TimePicker = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/time-picker').then((mod) => mod.default),
  {ssr: false},
)
const DatePicker = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/date-picker').then((mod) => mod.default),
  {ssr: false},
)
const Radio = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/radio').then((mod) => mod.default),
  {ssr: false},
)
const Checkbox = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/checkbox').then((mod) => mod.default),
  {ssr: false},
)
const FieldArray = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/field-array').then((mod) => mod.default),
  {ssr: false},
)
const Tabs = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/tabs').then((mod) => mod.default),
  {ssr: false},
)
const Wizard = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/wizard').then((mod) => mod.default),
  {ssr: false},
)
const DualListSelect = dynamic(
  () => import('@data-driven-forms/mui-component-mapper/dual-list-select').then((mod) => mod.default),
  {ssr: false},
)

export const IS_OPTION_EQUAL_TO_VALUE = ((option: any, value: any) => option.value === value)

export const PropertyEditorFieldFlag = {
  ...componentTypes,
  ICON_SELECT: 'icon-select',
}

export const componentMapper: ComponentMapper = {
  // ...muiComponentMapper,
  // [PropertyEditorFieldFlag.TEXT_FIELD]: FieldTextField,
  // [PropertyEditorFieldFlag.TEXTAREA]: FieldTextField,
  [PropertyEditorFieldFlag.SELECT]: {
    component: Select,
    isClearable: true,
    size: 'small',
    variant: 'outlined',
    TextFieldProps: {
      color: 'secondary',
    },
    isOptionEqualToValue: IS_OPTION_EQUAL_TO_VALUE,
  },
  [PropertyEditorFieldFlag.SWITCH]: {
    component: Switch,
    size: 'medium',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.TEXT_FIELD]: {
    component: TextField,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.TEXTAREA]: {
    component: Textarea,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.PLAIN_TEXT]: {
    component: PlainText,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.SLIDER]: {
    component: Slider,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.TIME_PICKER]: {
    component: TimePicker,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.DATE_PICKER]: {
    component: DatePicker,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.RADIO]: {
    component: Radio,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.CHECKBOX]: {
    component: Checkbox,
    size: 'small',
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.FIELD_ARRAY]: {
    component: FieldArray,
  },
  [PropertyEditorFieldFlag.TABS]: {
    component: Tabs,
    color: 'secondary',
  },
  [PropertyEditorFieldFlag.WIZARD]: {
    component: Wizard,
  },
  [PropertyEditorFieldFlag.DUAL_LIST_SELECT]: {
    component: DualListSelect,
  },
  [PropertyEditorFieldFlag.ICON_SELECT]: {
    component: FieldIconSelect,
    isClearable: true,
    size: 'small',
    isOptionEqualToValue: IS_OPTION_EQUAL_TO_VALUE,
  },
  // [PropertyEditorFieldFlag.SELECT]: FieldSelect,
  // [PropertyEditorFieldFlag.SWITCH]: FieldSwitch,
}
