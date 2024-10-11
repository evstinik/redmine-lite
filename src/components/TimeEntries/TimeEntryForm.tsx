import * as React from 'react'
import { useOnChange } from '@app/hooks/utils'
import {
  useAddTimeEntry,
  useTimeEntryActivities,
  usePrimaryTimeEntryActivity,
  useDayForTimeEntries,
  useFormattedDayForTimeEntries
} from '@app/hooks/timeEntries'
import { UnprocessableEntityError } from '@app/models/RedmineService'
import { convertToString } from '@app/models/RelativeDateFormatter'
import './TimeEntryForm.css'
import { capitalize } from '@app/models/String'
import { FavouriteEntries } from './FavouriteEntries'
import { TimeEntry } from '@app/models/api/TimeEntry'

interface TimeEntryFormProps {
  preselectedIssueId?: number
  onResetSelectedIssue: () => void
}

const validateTime = (value: string | number) => {
  if (typeof value === 'number') {
    return true
  }
  return /^\d+h\d+m$/.test(value)
}

export function TimeEntryForm(props: TimeEntryFormProps) {
  const { preselectedIssueId, onResetSelectedIssue } = props

  const activities = useTimeEntryActivities()
  const primaryActivityId = usePrimaryTimeEntryActivity()

  const [isCreating, setIsCreating] = React.useState(false)
  const [issue, setIssue] = React.useState(preselectedIssueId ?? '')
  const [spent, setSpent] = React.useState('')
  const [activity, setActivity] = React.useState(primaryActivityId)
  const [comment, setComment] = React.useState('')
  const [errors, setErrors] = React.useState<string[]>([])

  const onChangeIssue = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetSelectedIssue()
      setIssue(event.target.value)
    },
    [onResetSelectedIssue]
  )

  const dayForTimeEntries = useDayForTimeEntries()
  const formattedDay = capitalize(useFormattedDayForTimeEntries())

  React.useEffect(() => {
    if (preselectedIssueId) {
      setIssue(preselectedIssueId)
    }
  }, [preselectedIssueId])

  const addTimeEntry = useAddTimeEntry()

  const reset = React.useCallback(() => {
    setIssue('')
    setSpent('')
    setActivity(primaryActivityId)
    setComment('')
    setErrors([])
    onResetSelectedIssue()
  }, [primaryActivityId, onResetSelectedIssue])

  const submit = React.useCallback(
    (event) => {
      event.preventDefault()
      setErrors([])
      const isValid = validateTime(spent)
      if (!isValid) {
        setErrors(['Please enter time entry in format 1h3m'])
        return
      }
      setIsCreating(true)
      addTimeEntry({
        activity_id: Number(activity),
        comments: comment,
        hours: spent,
        issue_id: Number(issue),
        spent_on: dayForTimeEntries && convertToString(dayForTimeEntries)
      })
        .then(reset)
        .catch((error) => {
          if (error instanceof UnprocessableEntityError) {
            setErrors(error.errors)
          } else {
            setErrors([error.toString()])
          }
        })
        .then(() => {
          setIsCreating(false)
        })
    },
    [addTimeEntry, activity, comment, spent, issue, dayForTimeEntries, reset]
  )

  const prefillWithEntry = React.useCallback((timeEntry: TimeEntry) => {
    setSpent(`${timeEntry.hours}`)
    setIssue(timeEntry.issue.id)
    setActivity(timeEntry.activity.id)
    setComment(timeEntry.comments)
  }, [])

  return (
    <>
      <div className='time-entry-form'>
        <h2>Add new time entry</h2>
        <form onSubmit={submit}>
          <fieldset disabled={isCreating}>
            <label>
              {formattedDay} I spent{' '}
              <input
                type='text'
                className='hours'
                value={spent}
                onChange={useOnChange(setSpent)}
                required
              />
            </label>
            <label>
              {' '}
              on issue #
              <input
                type='text'
                className='issue'
                value={issue}
                onChange={onChangeIssue}
                required
              />
            </label>
            <label>
              {' '}
              while doing{' '}
              <select value={activity} onChange={useOnChange(setActivity)} required>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
              ,
            </label>
            <label>
              {' '}
              specifically doing{' '}
              <input
                type='text'
                className='comment'
                value={comment}
                onChange={useOnChange(setComment)}
              />
            </label>
            <input type='submit' className='contained' value='Add' />
          </fieldset>
        </form>
        <ul className='errors'>
          {errors.map((error, idx) => (
            <li key={`${idx}-error`}>{error}</li>
          ))}
        </ul>
        <p className='tip'>
          You can find issue by subject in neighbour section. Also you can click on issue number to
          copy id into this form
        </p>
      </div>

      <FavouriteEntries onEntryClicked={prefillWithEntry} />
    </>
  )
}
