import { useAppState } from './appState'
import { useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { useRedmineService } from './redmineService'
import { AppState } from '../models/AppState'

export function useUser() {
  const [{ user, apiKey }, setAppState] = useAppState()
  const redmineService = useRedmineService()
  useEffect(() => {
    let isLatest = true
    if (!user) {
      redmineService
        .getUser('current', apiKey!)
        .then((user) => {
          if (isLatest) {
            setAppState((appState) => ({
              ...appState,
              user
            }))
          }
        })
        .catch()
    }
    return () => {
      isLatest = false
    }
  }, [setAppState, redmineService, user, apiKey])
  return user
}

export function useLogout(setAppState: Dispatch<SetStateAction<AppState>>) {
  return useCallback(() => {
    setAppState((oldState) => ({
      ...oldState,
      apiKey: undefined,
      activities: undefined,
      primaryActivityId: undefined,
      user: undefined
    }))
  }, [setAppState])
}
