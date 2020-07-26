import { useState, useEffect } from "react";
import { Issue } from "../models/IssuesPaginatedList";
import { useRedmineService } from "./redmineService";
import { useApiKey } from "./apiKey";

export function useIssuesSearch(query: string, projectId: number): [Issue[], boolean] {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const apiKey = useApiKey()
  const redmineService = useRedmineService()

  useEffect(() => {
    let isCancelled = false;
    const _params = { query, projectId }

    setIsLoading(true)

    redmineService
      .getIssues(0, 20, _params, apiKey!)
      .then(({ issues }) => {
        if (!isCancelled && _params.projectId === projectId && _params.query === query) {
          setIssues(issues);
        }
      })
      .catch()
      .then(() => setIsLoading(false))

    return () => {
      console.log('Cancelled', query, projectId, _params)
      isCancelled = true;
    };
  }, [apiKey, projectId, query, redmineService]);

  return [issues, isLoading]
}
