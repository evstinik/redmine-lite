import * as React from 'react'
import { TimeEntry } from "../models/api/TimeEntry";
import { useDeleteTimeEntry } from '../hooks/timeEntries';
import './TimeEntryRow.css'

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
    <li className="time-entry-row">
      <div className="line">
        <span className="hours">{timeEntry.hours}h</span>
        <span className="issue">Issue #{timeEntry.issue.id}</span>
        <span className="project">{timeEntry.project.name}</span>
      </div>
      <div className="line">
        <p className="comment">
          <span className="activity">{timeEntry.activity.name}: </span>
          {timeEntry.comments}
        </p>
        <div className="actions">
          <button
            className="bordered"
            disabled={isDeleting}
            onClick={deleteWithConfirmation}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}