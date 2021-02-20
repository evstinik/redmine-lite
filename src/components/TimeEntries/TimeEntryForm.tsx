import * as React from 'react'
import { useOnChange } from 'hooks/utils'
import { useAddTimeEntry, useTimeEntryActivities, usePrimaryTimeEntryActivity, useDayForTimeEntries, useFormattedDayForTimeEntries } from 'hooks/timeEntries'
import { UnprocessableEntityError } from 'models/RedmineService'
import { convertToString } from 'models/RelativeDateFormatter'
import './TimeEntryForm.css'
import { capitalize } from 'models/String'

interface TimeEntryFormProps {
  preselectedIssueId?: number;
  onResetSelectedIssue: () => void
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

  const onChangeIssue = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onResetSelectedIssue()
    setIssue(event.target.value)
  }, [])

  const dayForTimeEntries = useDayForTimeEntries()
  const formattedDay = capitalize(useFormattedDayForTimeEntries())

  React.useEffect(() => {
    if (preselectedIssueId) {
      setIssue(preselectedIssueId);
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
  }, [setIssue, setSpent, setComment, primaryActivityId])

  const submit = React.useCallback((event) => {
    event.preventDefault() 
    setIsCreating(true)
    addTimeEntry({
      activity_id: Number(activity),
      comments: comment,
      hours: Number(spent),
      issue_id: Number(issue),
      spent_on: dayForTimeEntries && convertToString(dayForTimeEntries),
    })
      .then(reset)
      .catch((error) => {
        if (error instanceof UnprocessableEntityError) {
          setErrors(error.errors);
        } else {
          setErrors([error.toString()]);
        }
      })
      .then(() => {
        setIsCreating(false);
      });
  }, [addTimeEntry, activity, comment, spent, issue, dayForTimeEntries, reset])

  return (
    <div className="time-entry-form">
      <h2>Add new time entry</h2>
      <form onSubmit={submit}>
        <fieldset disabled={isCreating}>
          <label>
            {formattedDay} I spent{" "}
            <input
              type="text"
              className="hours"
              value={spent}
              onChange={useOnChange(setSpent)}
              required
            />
            h
          </label>
          <label>
            {" "}
            on issue #
            <input
              type="text"
              className="issue"
              value={issue}
              onChange={onChangeIssue}
              required
            />
          </label>
          <label>
            {" "}
            while doing{" "}
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
            ,
          </label>
          <label>
            {" "}
            specifically doing{" "}
            <input
              type="text"
              className="comment"
              value={comment}
              onChange={useOnChange(setComment)}
            />
          </label>
          <input type="submit" className="contained" value="Add" />
        </fieldset>
      </form>
      <ul className="errors">
        {errors.map((error, idx) => (
          <li key={`${idx}-error`}>{error}</li>
        ))}
      </ul>
      <p className="tip">
        You can find issue by subject in neighbour section. Also you can click
        on issue number to copy id into this form
      </p>
    </div>
  );
}