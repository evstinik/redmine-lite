import * as React from 'react'
import { useOnChange } from '../hooks/utils'
import { useAddTimeEntry, useTimeEntryActivities, usePrimaryTimeEntryActivity } from '../hooks/timeEntries'
import { UnprocessableEntityError } from '../models/RedmineService'

export function TimeEntryForm() {
  const activities = useTimeEntryActivities()
  const primaryActivityId = usePrimaryTimeEntryActivity()

  const [issue, setIssue] = React.useState('')
  const [spent, setSpent] = React.useState('')
  const [activity, setActivity] = React.useState(primaryActivityId)
  const [comment, setComment] = React.useState('')
  const [errors, setErrors] = React.useState<string[]>([])

  const addTimeEntry = useAddTimeEntry()

  const reset = React.useCallback(() => {
    setIssue('')
    setSpent('')
    setComment('')
    setErrors([])
  }, [setIssue, setSpent, setComment])

  const submit = React.useCallback((event) => {
    event.preventDefault() 
    addTimeEntry({
      activity_id: Number(activity),
      comments: comment,
      hours: Number(spent),
      issue_id: Number(issue)
    })
    .then(reset)
    .catch(error => {
      if (error instanceof UnprocessableEntityError) {
        setErrors(error.errors)
      } else {
        setErrors([error.toString()])
      }
    })
  }, [addTimeEntry, activity, comment, spent, issue, reset])

  return (
    <div>
      <form onSubmit={submit}>
        <label>Issue #</label>
        <input
          type="text"
          value={issue}
          onChange={useOnChange(setIssue)}
          required
        />
        <label>Spent</label>
        <input
          type="text"
          value={spent}
          onChange={useOnChange(setSpent)}
          required
        />
        <label>Activity</label>
        <select value={activity} onChange={useOnChange(setActivity)} required>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
        <label>Comment</label>
        <input type="text" value={comment} onChange={useOnChange(setComment)} />
        <input type="submit" value="Add" />
      </form>
      <ul>
        {errors.map((error, idx) => (
          <li key={`${idx}-error`}>{error}</li>
        ))}
      </ul>
    </div>
  );
}