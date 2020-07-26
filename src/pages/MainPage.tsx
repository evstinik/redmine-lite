import * as React from 'react'
import { TimeEntries } from '../TimeEntries/TimeEntries';
import { Greetings } from '../User/Greetings';
import { TimeEntryForm } from '../TimeEntries/TimeEntryForm';
import { IssuesSearch } from '../Issues/IssuesSearch';
import { Issue } from '../models/api/Issue';

export function MainPage() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue>();

  return (
    <div>
      <Greetings />
      <TimeEntries />
      <TimeEntryForm preselectedIssueId={selectedIssue?.id} />
      <IssuesSearch onSelect={setSelectedIssue} />
    </div>
  );
}