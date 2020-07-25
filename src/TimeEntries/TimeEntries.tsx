import * as React from "react";
import { useTimeEntries } from "../hooks/timeEntries";
import { TimeEntryRow } from "./TimeEntryRow";
import { useUser } from "../hooks/user";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntry } from "../models/TimeEntriesResponse";

function sortByDateAsc(te1: TimeEntry, te2: TimeEntry) {
  return (
    te1.spent_on.localeCompare(te2.spent_on) ||
    te1.created_on.localeCompare(te2.created_on)
  )
} 

export function TimeEntries() {
  const user = useUser()
  const timeEntries = useTimeEntries()
  const sortedTimeEntries = React.useMemo(() => {
    return timeEntries && [...timeEntries].sort(sortByDateAsc);
  }, [timeEntries])

  return (
    <div>
      <h1>Hi, {user?.firstname ?? "..."}!</h1>
      {!sortedTimeEntries && (
        <h2>I'm loading your time entries for today...</h2>
      )}
      {sortedTimeEntries && (
        <>
          <h2>Here's your time entries for today</h2>
          <ul>
            {sortedTimeEntries.map((timeEntry) => (
              <TimeEntryRow key={timeEntry.id} timeEntry={timeEntry} />
            ))}
          </ul>
          <h2>Add new time entry</h2>
          <TimeEntryForm />
        </>
      )}
    </div>
  );
}
