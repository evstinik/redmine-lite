import { useAppState } from "./appState";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useRedmineService } from "./redmineService";
import { CreateTimeEntry } from "../models/TimeEntryRequest";
import { TimeEntryActivity } from "../models/TimeEntryActivity";

export function useTimeEntries() {
  const [{ timeEntries, apiKey }, setAppState] = useAppState()
  const [isLoading, setIsLoading] = useState(false);
  const redmineService = useRedmineService()
  useEffect(() => {
    if (!timeEntries && !isLoading) {
      setIsLoading(true);
      redmineService
        .getTimeEntries("me", new Date(), apiKey!)
        .then((timeEntries) => {
          setAppState(appState => ({
            ...appState,
            timeEntries,
          }));
        })
        .catch()
        .then(() => setIsLoading(false));
    }
  }, [isLoading, setAppState, redmineService, timeEntries, apiKey]);
  return timeEntries
}

export function useAddTimeEntry() {
  const redmineService = useRedmineService()
  const [{ apiKey }, setAppState] = useAppState()
  return useCallback(async (timeEntry: CreateTimeEntry) => {
    return redmineService.addTimeEntry(timeEntry, apiKey!)
      .then(createdTimeEntry => {
        setAppState(appState => ({
          ...appState,
          timeEntries: [
            ...(appState.timeEntries ?? []),
            createdTimeEntry
          ]
        }))
      })
  }, [apiKey, redmineService, setAppState])
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
            timeEntries:
              appState.timeEntries &&
              appState.timeEntries.filter(({ id }) => timeEntryId !== id),
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