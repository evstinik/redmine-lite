import * as React from "react";
import { useTimeEntries } from "../hooks/timeEntries";
import { TimeEntryRow } from "./TimeEntryRow";
import { useUser } from "../hooks/user";
import { TimeEntryForm } from "./TimeEntryForm";

export function TimeEntries() {
  const user = useUser()
  const timeEntries = useTimeEntries()

  return (
    <div>
      <h1>Hi, {user?.firstname ?? "..."}!</h1>
      {!timeEntries && <h2>I'm loading your time entries for today...</h2>}
      {timeEntries && (
        <>
          <h2>Here's your time entries for today</h2>
          <ul>
            {timeEntries.map((timeEntry) => (
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
