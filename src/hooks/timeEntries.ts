import { useAppState } from "./appState";
import { useEffect } from "react";
import { useRedmineService } from "./redmineService";

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