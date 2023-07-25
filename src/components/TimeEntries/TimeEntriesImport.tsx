import * as React from 'react'
import {
  useAddTimeEntry,
  usePrimaryTimeEntryActivity,
  useTimeEntryActivities
} from 'hooks/timeEntries'
import { useOnChange } from 'hooks/utils'
import { UnprocessableEntityError } from 'models/RedmineService'
import './TimeEntriesImport.css'

interface ImportedTimeEntry {
  date: string
  timeInHours: number
  description: string
}

interface ImportSettings {
  /** Zero-based row index of first row containing data */
  startRow: number
  /** Zero-based column index containing date */
  dateCol: number
  /** Zero-based column index containing time */
  timeCol: number
  /** Zero-based column index containing description */
  descriptionCol: number
  /** CSV separator */
  separator: string
}
abstract class ImportSettings {
  /** Default settings for DAMI IS export */
  static default: ImportSettings = {
    startRow: 11,
    dateCol: 0,
    timeCol: 1,
    descriptionCol: 2,
    separator: ';'
  }
}

function parseCsv(
  file: File,
  settings: ImportSettings,
  onSuccess: (timeEntries: ImportedTimeEntry[]) => void
) {
  const { startRow, dateCol, timeCol, descriptionCol, separator } = settings

  function trimQuotes(s?: string): string | undefined {
    return s?.replace(/^"(.*)"$/, '$1')
  }

  function parseTime(s: string): number {
    const [hours, minutes, seconds] = s.split(':')
    return parseInt(hours) + parseInt(minutes) / 60 + parseInt(seconds) / (60 * 60)
  }

  function parseDate(s: string): string {
    const [day, month, year] = s.split('.')
    return [year, month, day].join('-')
  }

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    const contents = reader.result
    if (!contents) {
      return
    }
    const rows = (contents as string).split('\n')
    const timeEntries: ImportedTimeEntry[] = []
    for (let rowIdx = startRow; rowIdx < rows.length; rowIdx += 1) {
      if (rows[rowIdx].trim().length === 0) {
        continue
      }
      const cols = rows[rowIdx].split(separator)
      const date = trimQuotes(cols[dateCol]) ?? 'N/A'
      const time = trimQuotes(cols[timeCol]) ?? 'N/A'
      const description = trimQuotes(cols[descriptionCol]) ?? 'N/A'
      const timeInHours = parseTime(time)
      const dateISO = parseDate(date)
      timeEntries.push({ date: dateISO, timeInHours, description })
    }
    onSuccess(timeEntries)
  })
  reader.readAsText(file)
}

const timeInHoursFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2
})

export function TimeEntriesImport() {
  const activities = useTimeEntryActivities()
  const primaryActivityId = usePrimaryTimeEntryActivity()
  const addTimeEntry = useAddTimeEntry()
  const [timeEntries, setTimeEntries] = React.useState<ImportedTimeEntry[]>([])

  const [issue, setIssue] = React.useState('')
  const [activity, setActivity] = React.useState(primaryActivityId)
  const [isImporting, setIsImporting] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  const isImportEnabled = timeEntries.length > 0 && !isImporting

  const parse = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      parseCsv(file, ImportSettings.default, setTimeEntries)
    }
  }, [])

  const reset = React.useCallback(() => {
    setIssue('')
    setTimeEntries([])
    setActivity(primaryActivityId)
    setErrors([])
  }, [setIssue, setTimeEntries, setActivity, primaryActivityId])

  const importTimeEntries = React.useCallback(
    (event) => {
      event.preventDefault()
      setIsImporting(true)
      Promise.all(
        timeEntries.map((timeEntry) =>
          addTimeEntry({
            activity_id: Number(activity),
            comments: timeEntry.description,
            hours: Number(timeEntry.timeInHours),
            issue_id: Number(issue),
            spent_on: timeEntry.date
          })
        )
      )
        .then(reset)
        .catch((error) => {
          if (error instanceof UnprocessableEntityError) {
            setErrors(error.errors)
          } else {
            setErrors([error.toString()])
          }
        })
        .then(() => {
          setIsImporting(false)
        })
    },
    [activity, addTimeEntry, issue, reset, timeEntries]
  )

  return (
    <div className='time-entries-import'>
      <h2>Import time entries</h2>
      <form>
        <label>
          Select CSV file <input type='file' accept='text/plain' onChange={parse} required />
        </label>
      </form>
      <ul className='time-entries-list'>
        {timeEntries.map((timeEntry, idx) => (
          <li key={idx} className='time-entry'>
            <span className='date'>{timeEntry.date}</span>
            <span className='time'>{timeInHoursFormatter.format(timeEntry.timeInHours)}h</span>
            <span className='description'>{timeEntry.description}</span>
          </li>
        ))}
      </ul>
      <form className='import-form' onSubmit={importTimeEntries}>
        <fieldset disabled={!isImportEnabled}>
          <label>
            Issue #
            <input
              type='text'
              className='issue'
              value={issue}
              onChange={useOnChange(setIssue)}
              required
            />
          </label>
          <label>
            Activity
            <select value={activity} onChange={useOnChange(setActivity)} required>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <input type='submit' className='contained' value='Import' />
        </fieldset>
      </form>
      <ul className='errors'>
        {errors.map((error, idx) => (
          <li key={`${idx}-error`}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
