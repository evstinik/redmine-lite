import { useState, useEffect, useMemo } from 'react'
import { Issue } from '../models/api/Issue'
import { useRedmineService } from './redmineService'
import { useApiKey } from './apiKey'

export function useIssuesSearch(query: string, projectId: number, refreshKey = 0): [Issue[], boolean] {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const apiKey = useApiKey()
  const redmineService = useRedmineService()

  useEffect(() => {
    let isCancelled = false
    const _params = { query, projectId }

    setIsLoading(true)

    redmineService
      .getIssues(0, 20, _params, apiKey!)
      .then(({ issues }) => {
        if (!isCancelled && _params.projectId === projectId && _params.query === query) {
          setIssues(issues)
        }
      })
      .catch()
      .then(() => setIsLoading(false))

    return () => {
      console.log('Cancelled', query, projectId, _params)
      isCancelled = true
    }
  }, [apiKey, projectId, query, redmineService, refreshKey])

  return [issues, isLoading]
}

export function useIssuesDetailsByIds(ids: number[]): Record<number, Issue> {
  const apiKey = useApiKey()
  const redmineService = useRedmineService()

  const [issues, setIssues] = useState<Record<number, Issue>>({})

  const missingIssuesIds = useMemo(() => {
    return ids.filter((id) => !issues[id])
  }, [ids, issues])

  useEffect(() => {
    let cancelled = false
    if (apiKey) {
      redmineService.getIssuesByIds(missingIssuesIds, apiKey).then((issues) => {
        if (!cancelled) {
          setIssues((prev) => {
            return issues.reduce((acc, iss) => ({ ...acc, [iss.id]: iss }), prev)
          })
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [missingIssuesIds, apiKey])

  return issues
}
