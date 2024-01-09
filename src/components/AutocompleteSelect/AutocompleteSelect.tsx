import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export interface AutocompleteSelectOptionProps {
  id: number | string
  name: string
}

type MuiAutocompleteSelectProps = AutocompleteProps<
  AutocompleteSelectOptionProps,
  false,
  false,
  boolean,
  'div'
>

export type AutocompleteSelectFieldValue = string
export type AutocompleteSelectOptionValue = Parameters<
  Exclude<MuiAutocompleteSelectProps['onChange'], undefined>
>[1]

export interface AutocompleteSelectProps
  extends Omit<MuiAutocompleteSelectProps, 'renderInput' | 'getOptionLabel'> {
  name?: string
  label: string
  required?: boolean
  valueByName?: boolean
  getOptionLabel: (option: AutocompleteSelectOptionProps) => string
  value: string
  onValueChanged?: (newValue: string) => void
}

export const AutocompleteSelect: FC<AutocompleteSelectProps> = ({
  name,
  options,
  label,
  required,
  getOptionLabel,
  valueByName,
  value,
  onValueChanged,
  ...props
}) => {
  const valueType = useMemo(() => (valueByName ? 'name' : 'id'), [valueByName])

  const selectedOption = useMemo(
    () => options.find((o) => o[valueType] == value) ?? null,
    [value, options, valueType]
  )

  const handleChange = useCallback(
    (_: SyntheticEvent<Element, Event>, value: AutocompleteSelectOptionValue) => {
      if (typeof value === 'object') {
        onValueChanged?.(`${value?.[valueType] ?? ''}`)
        return
      }

      onValueChanged?.(value)
    },
    [onValueChanged, valueType]
  )

  return (
    <Autocomplete
      {...props}
      autoSelect
      getOptionLabel={(option) => (typeof option === 'string' ? option : getOptionLabel(option))}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      fullWidth={false}
      size='small'
      renderInput={(params) => (
        <TextField required={required} label={label} variant='standard' {...params} />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {getOptionLabel(option)}
        </li>
      )}
    />
  )
}
