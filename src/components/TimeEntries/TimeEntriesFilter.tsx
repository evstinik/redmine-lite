import * as React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { useAppState } from 'hooks/appState'
import './TimeEntriesFilter.css'
import 'react-datepicker/dist/react-datepicker.css'
import cs from 'date-fns/locale/cs'
registerLocale('cs', cs)

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
          />
        </label>
      </form>
    </div>
  )
}
