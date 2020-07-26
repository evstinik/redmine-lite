import { useAppState } from "./appState";
import { useEffect, useCallback } from "react";
import { useRedmineService } from "./redmineService";
import { AppState } from "../models/AppState";

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
        .catch()
    }
    return () => { isLatest = false }
  }, [appState, setAppState, redmineService])
  return appState.user
}

export function useLogout([appState, setAppState]: [AppState, (s: AppState) => void]) {
  return useCallback(() => {
    setAppState({
      ...appState,
      apiKey: undefined,
      activities: undefined,
      primaryActivityId: undefined,
      user: undefined
    });
  }, [appState, setAppState]);
}