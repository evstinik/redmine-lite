import { createContext, useContext, useEffect } from 'react'
import { AppState } from '../models/AppState'

export const AppStateContext = createContext<[AppState, (state: AppState) => void]>([AppState.load(), () => {}])

export function useAppState() {
  return useContext(AppStateContext)
}

export function useAppStateAutosaver(appState: AppState) {
  useEffect(() => {
    window.onunload = () => {
      AppState.store(appState)
    }
  }, [appState])
}