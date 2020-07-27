import * as React from 'react'
import { TimeEntries } from '../TimeEntries/TimeEntries';
import { Greetings } from '../User/Greetings';
import { TimeEntryForm } from '../TimeEntries/TimeEntryForm';
import { IssuesSearch } from '../Issues/IssuesSearch';
import { Issue } from '../models/api/Issue';
import './MainPage.css'

export function MainPage() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue>();

  return (
    <div className="page">
      <Greetings />
      <div className="content">
        <div>
          <TimeEntries />
          <TimeEntryForm preselectedIssueId={selectedIssue?.id} />
        </div>
        <div>
          <IssuesSearch onSelect={setSelectedIssue} />
        </div>
      </div>
    </div>
  );
}