import { useAppState } from "./appState";
import { useMemo } from "react";

export function useApiKey() {
  const [appState, setAppState] = useAppState()
  return useMemo(
    () => [appState.apiKey, (apiKey?: string) => setAppState({ ...appState, apiKey })], 
    [appState, setAppState]
  )
}