import * as React from 'react'
import { Issue } from '../models/api/Issue';
import './MainPage.css'
import {
  TimeEntries,
  Greetings,
  TimeEntryForm,
  IssuesSearch,
  TimeEntriesImport
} from "components";

export function MainPage() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue | null>(null);
  const resetSelectedIssues = React.useCallback(() => {
    setSelectedIssue(null)
  }, [])

  return (
    <div className="page">
      <Greetings />
      <div className="content">
        <div>
          <TimeEntries />
          <TimeEntryForm
            preselectedIssueId={selectedIssue?.id}
            onResetSelectedIssue={resetSelectedIssues}
          />
          <TimeEntriesImport />
        </div>
        <div>
          <IssuesSearch onSelect={setSelectedIssue} />
        </div>
      </div>
    </div>
  );
}