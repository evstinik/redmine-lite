import * as React from 'react'
import { TimeEntry } from "../models/TimeEntriesResponse";
import { useDeleteTimeEntry } from '../hooks/timeEntries';

interface TimeEntryRowProps {
  timeEntry: TimeEntry
}

export function TimeEntryRow({ timeEntry }: TimeEntryRowProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const deleteTimeEntry = useDeleteTimeEntry()

  const deleteWithConfirmation = React.useCallback(() => {
    let isCancelled = false
    const { id, hours, issue, comments } = timeEntry;
    const shortDescription = `${hours}h on #${issue.id} - ${comments}`;
    if (
      !window.confirm(`Are you sure you want to remove time entry "${shortDescription}"?`)
    ) {
      return;
    }
    setIsDeleting(true);
    deleteTimeEntry(id)
      .catch((err) => {
        if (!isCancelled) {
          // not reseting in `then`, anyway this row will dissapear
          setIsDeleting(false)
        }
        console.log("Error while deleting time entry:", err);
        alert("Deleting did not succeed");
      })
    return () => { isCancelled = true }
  }, [deleteTimeEntry, timeEntry, setIsDeleting]);

  return (
    <li>
      <span>{timeEntry.hours}h</span>
      <span> by </span>
      <span>{timeEntry.activity.name.toLocaleLowerCase()}</span>
      <span> on </span>
      <span>#{timeEntry.issue.id}</span>
      <span> ({timeEntry.project.name})</span>:<p>{timeEntry.comments}</p>
      <span>
        <button disabled={isDeleting} onClick={deleteWithConfirmation}>Delete</button>
      </span>
    </li>
  );
}