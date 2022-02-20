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

import {styled} from '@aglyn/shared-feature-themes'
import {
  FormControl as MuiFormControl,
  type FormControlProps as MuiFormControlProps,
  FormHelperText as MuiFormHelperText,
  InputLabel as MuiInputLabel,
  MenuItem as MuiMenuItem,
  type MenuItemProps as MuiMenuItemProps,
  Select as MuiSelect,
  type SelectProps as MuiSelectProps,
} from '@mui/material'
import {forwardRef, type ReactNode} from 'react'
import {withGridItem} from '../hocs/with-grid-item'
import {validationMessage} from '../utils/validation-message'
import {useFieldApi, type UseFieldApiConfig} from '../vendor/data-driven-forms'


export const SelectFormControl = styled(MuiFormControl, {
  name: 'AglynSelectFormControl',
})({
  width: '100%',
  display: 'flex',
})

export type FieldSelectBaseProps = (MuiSelectProps & UseFieldApiConfig)
export interface FieldSelectProps extends FieldSelectBaseProps {
  isReadOnly?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  description?: ReactNode
  validateOnMount?: boolean
  FormControlProps?: Partial<MuiFormControlProps>
  disableDefaultOption?: boolean
  defaultOption?: MuiMenuItemProps
}

const FieldSelect = forwardRef<any, FieldSelectProps>(
  function RefRenderFn(props, ref) {
    const {
      input,
      isReadOnly,
      isDisabled,
      placeholder,
      isRequired,
      label,
      helperText,
      description,
      validateOnMount,
      meta,
      inputProps,
      options = [],
      variant,
      FormControlProps,
      defaultOption,
      disableDefaultOption,
      ...rest
    } = useFieldApi(props)
    const invalidMessage = validationMessage(meta, validateOnMount)
    const helpText =
      invalidMessage ||
      ((meta.touched || validateOnMount) && meta.warning) ||
      helperText ||
      description

    return (
      <SelectFormControl ref={ref} variant={variant} size="small" {...FormControlProps}>
        <MuiInputLabel id={`field-select-${input.name}`}>{label}</MuiInputLabel>
        <MuiSelect
          {...input}
          disabled={isDisabled}
          error={Boolean(invalidMessage)}
          inputProps={{
            readOnly: isReadOnly,
            ...inputProps,
          }}
          label={label}
          labelId={`field-select-${input.name}`}
          required={isRequired}
          placeholder={placeholder}
          fullWidth
          {...rest}
        >
          {disableDefaultOption ? null : (
            <MuiMenuItem value={''} {...defaultOption}>
              {defaultOption?.children ?? 'None'}
            </MuiMenuItem>
          )}
          {options.map(({children, label, value, ...item}: any, index: number) => (
            <MuiMenuItem key={item.id ?? value ?? index} value={value} {...item}>
              {children ?? label}
            </MuiMenuItem>
          ))}
        </MuiSelect>
        {!helpText ? null : <MuiFormHelperText>{helpText}</MuiFormHelperText>}
      </SelectFormControl>
    )
  },
)

FieldSelect.displayName = 'FieldSelect'

export default withGridItem(FieldSelect)
