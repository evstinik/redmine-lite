import { useAppState } from "./appState";
import { useEffect } from "react";
import { useRedmineService } from "./redmineService";

export function useProjects() {
  const [appState, setAppState] = useAppState();
  const redmineService = useRedmineService();
  useEffect(() => {
    let isLatest = true;
    if (!appState.projects) {
      redmineService
        .getProjects(0, 100, appState.apiKey!)
        .then(({ projects }) => {
          if (isLatest) {
            setAppState({
              ...appState,
              projects,
            });
          }
        })
        .catch();
    }
    return () => {
      isLatest = false;
    };
  }, [appState, setAppState, redmineService]);
  return appState.projects;
}
