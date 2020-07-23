import * as React from 'react'
import { TimeEntry } from "../models/TimeEntriesResponse";

interface TimeEntryRowProps {
  timeEntry: TimeEntry
}

export function TimeEntryRow({ timeEntry }: TimeEntryRowProps) {
  return (
    <li>
      <span>{timeEntry.hours}h</span>
      <span> by </span>
      <span>{timeEntry.activity.name.toLocaleLowerCase()}</span>
      <span> on </span>
      <span>#{timeEntry.issue.id}</span>
      <span> ({timeEntry.project.name})</span>:
      <p>{timeEntry.comments}</p>
    </li>
  );
}