import * as React from 'react'
import { useOnChange } from '../hooks/utils'
import { useAddTimeEntry, useTimeEntryActivities, usePrimaryTimeEntryActivity } from '../hooks/timeEntries'
import { UnprocessableEntityError } from '../models/RedmineService'

interface TimeEntryFormProps {
  preselectedIssueId?: number
}

export function TimeEntryForm(props: TimeEntryFormProps) {
  const { preselectedIssueId } = props

  const activities = useTimeEntryActivities()
  const primaryActivityId = usePrimaryTimeEntryActivity()

  const [isCreating, setIsCreating] = React.useState(false)
  const [issue, setIssue] = React.useState(preselectedIssueId ?? '')
  const [spent, setSpent] = React.useState('')
  const [activity, setActivity] = React.useState(primaryActivityId)
  const [comment, setComment] = React.useState('')
  const [errors, setErrors] = React.useState<string[]>([])

  React.useEffect(() => {
    if (preselectedIssueId) {
      setIssue(preselectedIssueId);
    }
  }, [preselectedIssueId])

  const addTimeEntry = useAddTimeEntry()

  const reset = React.useCallback(() => {
    setIssue('')
    setSpent('')
    setComment('')
    setErrors([])
  }, [setIssue, setSpent, setComment])

  const submit = React.useCallback((event) => {
    event.preventDefault() 
    setIsCreating(true)
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
    .then(() => {
      setIsCreating(false)
    })
  }, [addTimeEntry, activity, comment, spent, issue, reset, setIsCreating])

  return (
    <div>
      <form onSubmit={submit}>
        <fieldset disabled={isCreating}>
          <label>
            Issue #
            <input
              id="time-entry-form-spent"
              type="text"
              value={issue}
              onChange={useOnChange(setIssue)}
              required
            />
          </label>
          <label>
            Spent
            <input
              type="text"
              value={spent}
              onChange={useOnChange(setSpent)}
              required
            />
          </label>
          <label>
            Activity
            <select
              value={activity}
              onChange={useOnChange(setActivity)}
              required
            >
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Comment
            <input
              type="text"
              value={comment}
              onChange={useOnChange(setComment)}
            />
          </label>
          <input type="submit" value="Add" />
        </fieldset>
      </form>
      <ul>
        {errors.map((error, idx) => (
          <li key={`${idx}-error`}>{error}</li>
        ))}
      </ul>
    </div>
  );
}