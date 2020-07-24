import { useAppState } from "./appState";
import { useEffect, useCallback } from "react";
import { useRedmineService } from "./redmineService";
import { CreateTimeEntry } from "../models/TimeEntryRequest";

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