import * as React from 'react'
import { useOnChange } from '../hooks/utils'
import { useAddTimeEntry, useTimeEntryActivities, usePrimaryTimeEntryActivity } from '../hooks/timeEntries'

export function TimeEntryForm() {
  const activities = useTimeEntryActivities()
  const primaryActivityId = usePrimaryTimeEntryActivity()

  const [issue, setIssue] = React.useState('')
  const [spent, setSpent] = React.useState('')
  const [activity, setActivity] = React.useState(primaryActivityId)
  const [comment, setComment] = React.useState('')

  const addTimeEntry = useAddTimeEntry()

  const reset = React.useCallback(() => {
    setIssue('')
    setSpent('')
    setComment('')
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
  }, [addTimeEntry, activity, comment, spent, issue, reset])

  return (
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
          <option key={activity.id} value={activity.id}>{activity.name}</option>
        ))}
      </select>
      <label>Comment</label>
      <input type="text" value={comment} onChange={useOnChange(setComment)} />
      <input type="submit" value="Add" />
    </form>
  );
}