import { TimeEntry } from 'models/api/TimeEntry'
import { useCallback, useMemo } from 'react'
import { useAppState } from './appState'

export function useFavourites() {
  const [appState, setAppState] = useAppState()
  const favs = useMemo(() => appState.favouries, [appState.favouries])

  const toggleFav = useCallback((entry: TimeEntry) => {
    setAppState((appState) => {
      const favs = appState.favouries ?? []
      let newFavs = [...favs]
      const idx = newFavs.findIndex((e) => e.id === entry.id)
      if (idx !== -1) {
        newFavs.splice(idx, 1)
      } else {
        newFavs.push(entry)
      }
      return { ...appState, favouries: newFavs }
    })
  }, [])

  return useMemo(
    () => ({
      favouriteEntries: favs,
      toggleFavouriteEntry: toggleFav
    }),
    [favs, toggleFav]
  )
}
