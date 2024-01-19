import {
  Autocomplete,
  AutocompleteProps,
  TextField as MUITextField,
  SxProps,
  Theme
} from '@mui/material'
import { ReactNode, useCallback, useMemo } from 'react'

export function searchByTerms<T>(query: string, items: T[], searchBy: (item: T) => string): T[] {
  const requiredTerms = query.toLowerCase().split(' ')
  return items.filter((item) => {
    const itemString = searchBy(item).toLowerCase()
    return requiredTerms.every((term) => itemString.includes(term))
  })
}

export interface AutocompleteSelectProps<T> {
  name?: string
  label: string
  required?: boolean
  getOptionValue: (option: T) => string
  getOptionLabel: (option: T) => string
  renderOption?: (option: T) => ReactNode
  value: string
  options: T[]
  onValueChanged?: (newValue: string | null) => void
  fullWidth?: boolean
  className?: string
  loading?: boolean
  loadingText?: string
  testId?: string
  dropdownTestId?: string
  sx?: SxProps<Theme>
  slotProps?: AutocompleteProps<any, any, any, any>['slotProps']
}

export function AutocompleteSelect<T>(props: AutocompleteSelectProps<T>) {
  const {
    options,
    getOptionValue,
    label,
    required,
    getOptionLabel,
    value,
    onValueChanged,
    renderOption,
    testId,
    dropdownTestId,
    ...rest
  } = props

  const selectedOption = useMemo(
    () => options.find((o) => getOptionValue(o) === value) ?? null,
    [value, options, getOptionValue]
  )

  const handleChange = useCallback(
    (_: any, value: T | null) => {
      if (value && typeof value === 'object') {
        onValueChanged?.(getOptionValue(value))
        return
      }
      onValueChanged?.(value as string | null)
    },
    [onValueChanged, getOptionValue]
  )

  return (
    <Autocomplete
      {...rest}
      blurOnSelect
      getOptionLabel={(option) => (typeof option === 'string' ? option : getOptionLabel(option))}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      fullWidth={false}
      size='small'
      renderInput={(params) => (
        <MUITextField
          required={required}
          label={label}
          {...params}
          InputProps={{ ...(params['InputProps'] ?? {}), 'data-testid': testId } as any}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={getOptionValue(option)}>
          {renderOption?.(option) ?? getOptionLabel(option)}
        </li>
      )}
      filterOptions={(options, state) => {
        return searchByTerms(state.inputValue, options, getOptionLabel)
      }}
      componentsProps={{
        popper: {
          'data-testid': dropdownTestId
        } as any,
        clearIndicator: {
          'data-testid': 'clear-indicator'
        } as any
      }}
    />
  )
}
