import * as React from 'react'
import { Issue } from '../models/api/Issue';
import {
  TimeEntries,
  Greetings,
  TimeEntryForm,
  IssuesSearch,
  TimeEntriesImport
} from "components";

import './MainPage.css'
import { FavouriteEntries } from 'components/TimeEntries/FavouriteEntries';

export function MainPage() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue | null>(null);
  const resetSelectedIssues = React.useCallback(() => {
    setSelectedIssue(null)
  }, [])

  return (
    <div className="page">
      <Greetings />
      <div className="page__content">
        <div className="page__content__panel">
          <TimeEntries />
          <TimeEntryForm
            preselectedIssueId={selectedIssue?.id}
            onResetSelectedIssue={resetSelectedIssues}
          />
          {/* <TimeEntriesImport /> */}
        </div>
        <div className="page__content__panel">
          <IssuesSearch onSelect={setSelectedIssue} />
        </div>
      </div>
    </div>
  );
}