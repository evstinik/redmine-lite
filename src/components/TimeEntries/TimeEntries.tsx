import * as React from 'react';
import { useTimeEntries, useDayForTimeEntries } from 'hooks/timeEntries';
import { TimeEntryRow } from './TimeEntryRow';
import { TimeEntry } from 'models/api/TimeEntry';
import { TimeEntriesFilter } from './TimeEntriesFilter';
import { RelativeDateFormatter } from 'models/RelativeDateFormatter';
import './TimeEntries.css';
import { useIssuesDetailsByIds } from 'hooks/issues';

function sortByDateAsc(te1: TimeEntry, te2: TimeEntry) {
  return te1.spent_on.localeCompare(te2.spent_on) || te1.created_on.localeCompare(te2.created_on);
}

export function TimeEntries() {
  const dayForTimeEntries = useDayForTimeEntries();
  const formattedDay = React.useMemo(() => {
    const df = new RelativeDateFormatter();
    return df.format(dayForTimeEntries);
  }, [dayForTimeEntries]);

  const timeEntries = useTimeEntries();
  const sortedTimeEntries = React.useMemo(() => {
    return timeEntries && [...timeEntries].sort(sortByDateAsc);
  }, [timeEntries]);

  const total = React.useMemo(() => {
    return timeEntries?.reduce((sum, timeEntry) => sum + timeEntry.hours, 0) ?? 0;
  }, [timeEntries]);

  const [isFilterVisible, setIsFilterVisible] = React.useState(false);
  const toggleFilter = React.useCallback(() => {
    setIsFilterVisible((isVisible) => !isVisible);
  }, [setIsFilterVisible]);

  const ids = React.useMemo(
    () => Array.from(new Set(timeEntries.map((te) => te.issue.id))),
    [timeEntries],
  );
  const issueDetailPerId = useIssuesDetailsByIds(ids);

  return (
    <div className='time-entries'>
      <h2>
        Here's your time entries for{' '}
        <span className='action' onClick={toggleFilter}>
          {formattedDay}
        </span>
      </h2>
      {isFilterVisible && <TimeEntriesFilter />}
      {!sortedTimeEntries && <p className='list-placeholder'>Loading...</p>}
      {sortedTimeEntries && (
        <>
          {sortedTimeEntries.length > 0 && (
            <>
              <ul>
                {sortedTimeEntries.map((timeEntry) => (
                  <TimeEntryRow
                    key={timeEntry.id}
                    timeEntry={timeEntry}
                    issueName={issueDetailPerId[timeEntry.issue.id]?.subject}
                  />
                ))}
              </ul>
              <p className='total'>
                Total: <span className='hours'>{total}h</span>
              </p>
            </>
          )}
          {sortedTimeEntries.length === 0 && (
            <p className='list-placeholder'>No time entries for {formattedDay}</p>
          )}
        </>
      )}
    </div>
  );
}
