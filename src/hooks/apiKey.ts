import { useAppState } from "./appState";
import { useMemo } from "react";

export function useApiKey(): string | undefined {
  const [appState] = useAppState()
  return useMemo(
    () => appState.apiKey, 
    [appState]
  )
}