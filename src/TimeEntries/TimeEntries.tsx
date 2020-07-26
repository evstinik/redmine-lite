import * as React from "react";
import { useTimeEntries } from "../hooks/timeEntries";
import { TimeEntryRow } from "./TimeEntryRow";
import { TimeEntry } from "../models/api/TimeEntry";

function sortByDateAsc(te1: TimeEntry, te2: TimeEntry) {
  return (
    te1.spent_on.localeCompare(te2.spent_on) ||
    te1.created_on.localeCompare(te2.created_on)
  )
} 

export function TimeEntries() {
  const timeEntries = useTimeEntries()
  const sortedTimeEntries = React.useMemo(() => {
    return timeEntries && [...timeEntries].sort(sortByDateAsc);
  }, [timeEntries])

  return (
    <div>
      <h2>Here's your time entries for today</h2>
      {!sortedTimeEntries && (
        <p>Loading...</p>
      )}
      {sortedTimeEntries && (
        <>
          {sortedTimeEntries.length > 0 && (
            <ul>
              {sortedTimeEntries.map((timeEntry) => (
                <TimeEntryRow key={timeEntry.id} timeEntry={timeEntry} />
              ))}
            </ul>
          )}
          {sortedTimeEntries.length === 0 && <p>No time entries for today</p>}
        </>
      )}
    </div>
  );
}
