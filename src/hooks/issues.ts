import { useState, useEffect } from "react";
import { Issue } from "../models/IssuesPaginatedList";
import { useRedmineService } from "./redmineService";
import { useApiKey } from "./apiKey";
import { IssuesSearchParams } from "../models/RedmineService";

export function useIssuesSearch(params: IssuesSearchParams): [Issue[], boolean] {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const apiKey = useApiKey()
  const redmineService = useRedmineService()

  useEffect(() => {
    let isCancelled = false;
    const _params = params

    setIsLoading(true)

    redmineService
      .getIssues(0, 20, params, apiKey!)
      .then(({ issues }) => {
        if (!isCancelled && _params === params) {
          setIssues(issues);
        }
      })
      .catch()
      .then(() => setIsLoading(false))

    return () => {
      isCancelled = true;
    };
  }, [params, redmineService, apiKey, setIssues]);

  return [issues, isLoading]
}
