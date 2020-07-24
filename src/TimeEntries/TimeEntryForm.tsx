import * as React from 'react'
import { useOnChange } from '../hooks/utils'
import { useAddTimeEntry } from '../hooks/timeEntries'

export function TimeEntryForm() {
  const [issue, setIssue] = React.useState('')
  const [spent, setSpent] = React.useState('')
  const [activity, setActivity] = React.useState("9")
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
        <option value="10">Analysis/Specification</option>
        <option value="62">Call/Meeting</option>
        <option value="53">Controlling</option>
        <option value="15">Deployment</option>
        <option value="8">Design</option>
        <option value="9">Development</option>
        <option value="14">Documentation/Revision</option>
        <option value="16">Hiring/HR_Management</option>
        <option value="13">Maintenance</option>
        <option value="11">Management</option>
        <option value="52">Marketing</option>
        <option value="49">Other</option>
        <option value="47">Sales</option>
        <option value="58">Self study</option>
        <option value="35">Support</option>
        <option value="12">Testing</option>
        <option value="57">Travel</option>
      </select>
      <label>Comment</label>
      <input type="text" value={comment} onChange={useOnChange(setComment)} />
      <input type="submit" value="Add" />
    </form>
  );
}