import { useAppState } from "./appState";
import { useEffect, useCallback, useMemo } from "react";
import { useRedmineService } from "./redmineService";
import { CreateTimeEntry } from "../models/TimeEntryRequest";
import { TimeEntryActivity } from "../models/TimeEntryActivity";

export function useTimeEntries() {
  const [appState, setAppState] = useAppState()
  const redmineService = useRedmineService()
  useEffect(() => {
    let isLatest = true
    if (!appState.timeEntries) {
      redmineService.getTimeEntries('me', new Date(), appState.apiKey!)
        .then(timeEntries => {
          if (isLatest) {
            setAppState({
              ...appState,
              timeEntries
            })
          }
        })
        .catch()
    }
    return () => { isLatest = false }
  }, [appState, setAppState, redmineService])
  return appState.timeEntries
}

export function useAddTimeEntry() {
  const redmineService = useRedmineService()
  const [appState, setAppState] = useAppState()
  return useCallback(async (timeEntry: CreateTimeEntry) => {
    return redmineService.addTimeEntry(timeEntry, appState.apiKey!)
      .then(createdTimeEntry => {
        setAppState({
          ...appState,
          timeEntries: [
            ...(appState.timeEntries ?? []),
            createdTimeEntry
          ]
        })
      })
  }, [redmineService, setAppState, appState])
}

export function useDeleteTimeEntry() {
  const redmineService = useRedmineService();
  const [appState, setAppState] = useAppState();
  return useCallback(
    async (timeEntryId: number) => {
      return redmineService
        .deleteTimeEntry(timeEntryId, appState.apiKey!)
        .then(() => {
          const timeEntries = appState.timeEntries &&
              appState.timeEntries.filter(({ id }) => timeEntryId !== id)
          setAppState({
            ...appState,
            timeEntries
          });
        });
    },
    [redmineService, setAppState, appState]
  );
}

export function useTimeEntryActivitiesFetcher() {
  const redmineService = useRedmineService()
  const [appState, setAppState] = useAppState();
  return useEffect(
    () => {
      if (appState.apiKey && !appState.activities) {
        redmineService
          .getTimeEntryActivities(appState.apiKey!)
          .then((activities) => {
            setAppState({
              ...appState,
              activities
            });
          })
      }
    },
    [redmineService, setAppState, appState, appState.apiKey, appState.activities]
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