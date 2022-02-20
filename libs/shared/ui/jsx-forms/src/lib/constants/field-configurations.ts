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

import type {FieldComponentMap} from '../types'
import optionIsEqualToValue from '../utils/option-is-equal-to-value'
import {
  FieldCheckbox,
  FieldDatePicker,
  FieldDualListSelect,
  FieldFieldArray,
  FieldIconSelect,
  FieldPlainText,
  FieldRadio,
  FieldSelect,
  FieldSlider,
  FieldSwitch,
  FieldTabs,
  FieldTextarea,
  FieldTextField,
  FieldTimePicker,
  FieldWizard,
} from './dynamic-fields'


export const FIELD_MAP_SELECT: FieldComponentMap = {
  component: FieldSelect,
  isClearable: true,
  size: 'small',
  variant: 'outlined',
  TextFieldProps: {
    color: 'secondary',
  },
  isOptionEqualToValue: optionIsEqualToValue,
}
export const FIELD_MAP_SWITCH: FieldComponentMap = {
  component: FieldSwitch,
  size: 'medium',
  color: 'secondary',
}
export const FIELD_MAP_TEXT_FIELD: FieldComponentMap = {
  component: FieldTextField,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_TEXTAREA: FieldComponentMap = {
  component: FieldTextarea,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_PLAIN_TEXT: FieldComponentMap = {
  component: FieldPlainText,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_SLIDER: FieldComponentMap = {
  component: FieldSlider,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_TIME_PICKER: FieldComponentMap = {
  component: FieldTimePicker,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_DATE_PICKER: FieldComponentMap = {
  component: FieldDatePicker,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_RADIO: FieldComponentMap = {
  component: FieldRadio,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_CHECKBOX: FieldComponentMap = {
  component: FieldCheckbox,
  size: 'small',
  color: 'secondary',
}
export const FIELD_MAP_FIELD_ARRAY: FieldComponentMap = {
  component: FieldFieldArray,
}
export const FIELD_MAP_TABS: FieldComponentMap = {
  component: FieldTabs,
  color: 'secondary',
}
export const FIELD_MAP_WIZARD: FieldComponentMap = {
  component: FieldWizard,
}
export const FIELD_MAP_DUAL_LIST_SELECT: FieldComponentMap = {
  component: FieldDualListSelect,
}
export const FIELD_MAP_ICON_PICKER: FieldComponentMap = {
  component: FieldIconSelect,
  isClearable: true,
  size: 'small',
  isOptionEqualToValue: optionIsEqualToValue,
}
