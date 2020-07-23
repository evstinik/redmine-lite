import { useAppState } from "./appState";
import { useEffect } from "react";
import { useRedmineService } from "./redmineService";

export function useUser() {
  const [appState, setAppState] = useAppState()
  const redmineService = useRedmineService()
  useEffect(() => {
    let isLatest = true
    if (!appState.user) {
      redmineService.getUser('current', appState.apiKey!)
        .then(user => {
          if (isLatest) {
            setAppState({
              ...appState,
              user
            })
          }
        })
    }
    return () => { isLatest = false }
  }, [appState, setAppState, redmineService])
  return appState.user
}