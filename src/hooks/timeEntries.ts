import { useAppState } from "./appState";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useRedmineService } from "./redmineService";
import { CreateTimeEntry } from "../models/api/CreateTimeEntry";
import { TimeEntryActivity } from "../models/api/TimeEntryActivity";
import { convertToString, isDaysEqual, RelativeDateFormatter } from '../models/RelativeDateFormatter'

export function useTimeEntries() {
  const [{ timeEntries, apiKey, dayForTimeEntries }, setAppState] = useAppState()
  const [isLoading, setIsLoading] = useState(false);
  const redmineService = useRedmineService()
  useEffect(() => {
    const day = dayForTimeEntries ?? new Date()
    const isCacheInvalid = !timeEntries || !isDaysEqual(timeEntries.day, day)
    if (isCacheInvalid && !isLoading) {
      setIsLoading(true);
      redmineService
        .getTimeEntries("me", day, apiKey!)
        .then((value) => ({
          value,
          day
        }))
        .then((timeEntries) => {
          setAppState(appState => ({
            ...appState,
            timeEntries
          }));
        })
        .catch()
        .then(() => setIsLoading(false));
    }
  }, [isLoading, setAppState, redmineService, timeEntries, apiKey, dayForTimeEntries]);
  return timeEntries?.value ?? []
}

export function useAddTimeEntry() {
  const redmineService = useRedmineService()
  const [{ apiKey, dayForTimeEntries = new Date() }, setAppState] = useAppState();
  return useCallback(async (timeEntry: CreateTimeEntry) => {
    return redmineService.addTimeEntry(timeEntry, apiKey!)
      .then(createdTimeEntry => {
        // eslint-disable-next-line eqeqeq
        if (createdTimeEntry.spent_on != convertToString(dayForTimeEntries)) {
          // do not update cache if time entry is not intended for currently selected day
          return
        }
        setAppState((appState) => ({
          ...appState,
          timeEntries: {
            day:
              appState.timeEntries?.day ??
              appState.dayForTimeEntries ??
              new Date(),
            value: [...(appState.timeEntries?.value ?? []), createdTimeEntry],
          },
        }));
      })
  }, [apiKey, dayForTimeEntries, redmineService, setAppState])
}

export function useDeleteTimeEntry() {
  const redmineService = useRedmineService();
  const [{ apiKey }, setAppState] = useAppState();
  return useCallback(
    async (timeEntryId: number) => {
      return redmineService
        .deleteTimeEntry(timeEntryId, apiKey!)
        .then(() => {
          setAppState((appState) => ({
            ...appState,
            timeEntries: appState.timeEntries && {
              ...appState.timeEntries,
              value: appState.timeEntries.value.filter(
                ({ id }) => timeEntryId !== id
              )
            }
          }));
        });
    },
    [apiKey, redmineService, setAppState]
  );
}

export function useTimeEntryActivitiesFetcher() {
  const redmineService = useRedmineService()
  const [{ activities, apiKey }, setAppState] = useAppState();
  return useEffect(
    () => {
      if (apiKey && !activities) {
        redmineService
          .getTimeEntryActivities(apiKey!)
          .then((activities) => {
            setAppState(appState => ({
              ...appState,
              activities
            }));
          })
      }
    },
    [redmineService, setAppState, apiKey, activities]
  );
}

export function useTimeEntryActivities() {
  const [appState] = useAppState()
  return useMemo(() => appState.activities ?? TimeEntryActivity.default, [appState.activities])
}

export function usePrimaryTimeEntryActivity() {
  const [{ primaryActivityId, activities }] = useAppState();
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
    const df = new RelativeDateFormatter();
    return df.format(day);
  }, [day]);
}