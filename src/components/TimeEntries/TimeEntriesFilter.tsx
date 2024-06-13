import * as React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { useAppState } from '@app/hooks/appState'
import './TimeEntriesFilter.css'
import 'react-datepicker/dist/react-datepicker.css'

import cs from 'date-fns/locale/cs'
import en from 'date-fns/locale/en-GB'
import de from 'date-fns/locale/de'
registerLocale('cs', cs)
registerLocale('en', en)
registerLocale('de', de)

export function TimeEntriesFilter() {
  const [{ dayForTimeEntries = new Date() }, setAppState] = useAppState()

  const setDate = React.useCallback(
    (date: Date) => {
      setAppState((appState) => ({
        ...appState,
        dayForTimeEntries: date
      }))
    },
    [setAppState]
  )

  return (
    <div className='time-entries-filter'>
      <h3>Filter</h3>
      <form>
        <label onClick={(e) => e.preventDefault()}>
          Day
          <DatePicker
            className='date-picker'
            dateFormat='dd.MM.yyyy'
            selected={dayForTimeEntries}
            onChange={setDate}
            locale={navigator.language.slice(0, 2)}
          />
        </label>
      </form>
    </div>
  )
}
