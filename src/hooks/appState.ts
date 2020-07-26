import { createContext, useContext, useEffect, SetStateAction } from 'react'
import { AppState } from '../models/AppState'

export const AppStateContext = createContext<[AppState, React.Dispatch<SetStateAction<AppState>>]>([AppState.load(), (s) => s])

export function useAppState() {
  return useContext(AppStateContext)
}

export function useAppStateAutosaver() {
  const [appState] = useAppState()
  useEffect(() => {
    window.onunload = () => {
      AppState.store(appState)
    }
  }, [appState])
}