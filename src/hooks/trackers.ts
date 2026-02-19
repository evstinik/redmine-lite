import { useState, useEffect } from 'react'
import { Tracker } from '@app/models/api/Issue'
import { useRedmineService } from './redmineService'
import { useApiKey } from './apiKey'

interface UseTrackersResult {
  trackers: Tracker[]
  isLoading: boolean
  error: string | null
}

export function useTrackers(enabled: boolean): UseTrackersResult {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiKey = useApiKey()
  const redmineService = useRedmineService()

  useEffect(() => {
    if (!enabled || !apiKey) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    redmineService
      .getTrackers(apiKey)
      .then((t) => {
        if (!cancelled) setTrackers(t)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Failed to load trackers')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, apiKey, redmineService])

  return { trackers, isLoading, error }
}