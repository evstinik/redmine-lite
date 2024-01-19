import * as React from 'react'
import { Issue } from '../../models/api/Issue'
import { TimeEntries, TimeEntryForm, IssuesSearch } from 'components'

export function TimeTracking() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue | null>(null)
  const resetSelectedIssues = React.useCallback(() => {
    setSelectedIssue(null)
  }, [])

  return (
    <>
      <div className='page__content__panel'>
        <TimeEntries />
        <TimeEntryForm
          preselectedIssueId={selectedIssue?.id}
          onResetSelectedIssue={resetSelectedIssues}
        />
      </div>
      <div className='page__content__panel'>
        <IssuesSearch onSelect={setSelectedIssue} />
      </div>
    </>
  )
}
