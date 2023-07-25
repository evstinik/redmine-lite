import { useAppState } from './appState'
import { useEffect, useCallback, useMemo, useState } from 'react'
import { useRedmineService } from './redmineService'
import { CreateTimeEntry } from '../models/api/CreateTimeEntry'
import { TimeEntryActivity } from '../models/api/TimeEntryActivity'
import {
  convertToString,
  isDaysEqual,
  RelativeDateFormatter
} from '../models/RelativeDateFormatter'
import { UpdateTimeEntry } from 'models/api/UpdateTimeEntry'

export function useTimeEntries() {
  const [{ timeEntries, apiKey, dayForTimeEntries }, setAppState] = useAppState()
  const [isLoading, setIsLoading] = useState(false)
  const redmineService = useRedmineService()
  useEffect(() => {
    const day = dayForTimeEntries ?? new Date()
    const isCacheInvalid = !timeEntries || !isDaysEqual(timeEntries.day, day)
    let canceled = false
    if (!isCacheInvalid || isLoading) {
      return
    }
    console.log('Loading time entries...')
    setIsLoading(true)
    redmineService
      .getTimeEntries('me', day, apiKey!)
      .then((value) => ({
        value,
        day
      }))
      .then((timeEntries) => {
        if (canceled) {
          return Promise.reject(new Error('Cancelled'))
        }
        // Save intermediate state (overview)
        setAppState((appState) => ({
          ...appState,
          timeEntries
        }))
      })
      //   // And start loading details (issues)
      //   const issueIds = timeEntries.value.map((te) => te.issue.id);
      //   return redmineService
      //     .getIssuesByIds(issueIds, apiKey!)
      //     .then((issuesList) => {
      //       let timeEntriesWithIssues = [...timeEntries.value];
      //       issuesList.issues.forEach((issue) => {
      //         timeEntriesWithIssues = timeEntriesWithIssues.map(te => {
      //           if (te.issue.id == issue.id) {
      //             te.issue = issue
      //           }
      //           return te
      //         })
      //       });
      //       return timeEntriesWithIssues;
      //     });
      // })
      // .then((issuesWithDetails) => {
      //   if (canceled) {
      //     return Promise.reject(new Error('Cancelled'))
      //   }
      //   // Save issues with details
      //   setAppState((appState) => ({
      //     ...appState,
      //     timeEntries: {
      //       day,
      //       value: issuesWithDetails,
      //     },
      //   }));
      // })
      .catch((err) => {
        console.log(err)
        return Promise.resolve()
      })
      .then(() => {
        if (!canceled) {
          setIsLoading(false)
        }
      })
    return () => {
      canceled = true
    }
  }, [setAppState, redmineService, apiKey, dayForTimeEntries])
  return timeEntries?.value ?? []
}

export function useAddTimeEntry() {
  const redmineService = useRedmineService()
  const [{ apiKey, dayForTimeEntries = new Date() }, setAppState] = useAppState()
  return useCallback(
    async (timeEntry: CreateTimeEntry) => {
      return redmineService.addTimeEntry(timeEntry, apiKey!).then((createdTimeEntry) => {
        // eslint-disable-next-line eqeqeq
        if (createdTimeEntry.spent_on != convertToString(dayForTimeEntries)) {
          // do not update cache if time entry is not intended for currently selected day
          return
        }
        setAppState((appState) => ({
          ...appState,
          timeEntries: {
            day: appState.timeEntries?.day ?? appState.dayForTimeEntries ?? new Date(),
            value: [...(appState.timeEntries?.value ?? []), createdTimeEntry]
          }
        }))
      })
    },
    [apiKey, dayForTimeEntries, redmineService, setAppState]
  )
}

export function useUpdateTimeEntry() {
  const redmineService = useRedmineService()
  const [{ apiKey, dayForTimeEntries = new Date() }, setAppState] = useAppState()
  return useCallback(
    async (id: number, timeEntry: UpdateTimeEntry) => {
      return redmineService.updateTimeEntry(id, timeEntry, apiKey!).then(() => {
        // eslint-disable-next-line eqeqeq
        if (timeEntry.spent_on != convertToString(dayForTimeEntries)) {
          // do not update cache if time entry is not intended for currently selected day
          return
        }
        setAppState((appState) => ({
          ...appState,
          timeEntries: {
            day: appState.timeEntries?.day ?? appState.dayForTimeEntries ?? new Date(),
            value:
              appState.timeEntries?.value.map((te) => {
                return te.id == id ? { ...te, ...timeEntry } : te
              }) ?? []
          }
        }))
      })
    },
    [apiKey, dayForTimeEntries, redmineService, setAppState]
  )
}

export function useDeleteTimeEntry() {
  const redmineService = useRedmineService()
  const [{ apiKey }, setAppState] = useAppState()
  return useCallback(
    async (timeEntryId: number) => {
      return redmineService.deleteTimeEntry(timeEntryId, apiKey!).then(() => {
        setAppState((appState) => ({
          ...appState,
          timeEntries: appState.timeEntries && {
            ...appState.timeEntries,
            value: appState.timeEntries.value.filter(({ id }) => timeEntryId !== id)
          }
        }))
      })
    },
    [apiKey, redmineService, setAppState]
  )
}

export function useTimeEntryActivitiesFetcher() {
  const redmineService = useRedmineService()
  const [{ activities, apiKey }, setAppState] = useAppState()
  return useEffect(() => {
    if (apiKey && !activities) {
      redmineService.getTimeEntryActivities(apiKey!).then((activities) => {
        setAppState((appState) => ({
          ...appState,
          activities
        }))
      })
    }
  }, [redmineService, setAppState, apiKey, activities])
}

export function useTimeEntryActivities() {
  const [appState] = useAppState()
  return useMemo(() => appState.activities ?? TimeEntryActivity.default, [appState.activities])
}

export function usePrimaryTimeEntryActivity() {
  const [{ primaryActivityId, activities }] = useAppState()
  if (primaryActivityId) {
    return primaryActivityId
  }
  if (activities && activities.length > 0) {
    return activities[0].id
  }
  return undefined
}

export function useDayForTimeEntries() {
  const [{ dayForTimeEntries }] = useAppState()
  return dayForTimeEntries ?? new Date()
}

export function useFormattedDayForTimeEntries() {
  const day = useDayForTimeEntries()
  return useMemo(() => {
    const df = new RelativeDateFormatter()
    return df.format(day)
  }, [day])
}
