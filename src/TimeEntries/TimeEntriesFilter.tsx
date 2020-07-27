import * as React from 'react'
import { useOnChange } from '../hooks/utils'
import { useAppState } from '../hooks/appState'
import { convertToString } from '../models/RelativeDateFormatter'

export function TimeEntriesFilter() {
  const [{ dayForTimeEntries }, setAppState] = useAppState()

  const date = React.useMemo(() => {
    return convertToString(dayForTimeEntries ?? new Date())
  }, [dayForTimeEntries])

  const setDate = React.useCallback((value: string) => {
    setAppState((appState) => ({
      ...appState,
      dayForTimeEntries: new Date(value)
    }))
  }, [setAppState])

  return (
    <div>
      <h3>Time entries filter</h3>
      <form>
        <label>
          Day
          <input type="date" value={date} onChange={useOnChange(setDate)} />
        </label>
      </form>
    </div>
  );
}