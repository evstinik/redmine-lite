import * as React from "react";
import { useTimeEntries } from "../hooks/timeEntries";
import { TimeEntryRow } from "./TimeEntryRow";
import { useUser } from "../hooks/user";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntry } from "../models/TimeEntriesResponse";
import { IssuesSearch } from "../Issues/IssuesSearch";
import { Issue } from "../models/IssuesPaginatedList";
import { UserPreferences } from "../User/UserPreferences";

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

  const [selectedIssue, setSelectedIssue] = React.useState<Issue>()

  const [isPreferencesVisible, setIsPreferencesVisible] = React.useState(false)
  const toggleUserPreferences = React.useCallback(() => {
    setIsPreferencesVisible(isVisible => !isVisible)
  }, [setIsPreferencesVisible])

  return (
    <div>
      <h1 onClick={toggleUserPreferences}>Hi, {user?.firstname ?? "..."}!</h1>
      {isPreferencesVisible && <UserPreferences />}
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
      <TimeEntryForm preselectedIssueId={selectedIssue?.id} />
      <IssuesSearch onSelect={setSelectedIssue} />
    </div>
  );
}
