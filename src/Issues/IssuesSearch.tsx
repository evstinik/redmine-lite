import * as React from 'react'
import { useIssuesSearch } from '../hooks/issues';
import { IssueRow } from './IssueRow';
import { useOnChange } from '../hooks/utils';
import { Issue } from '../models/IssuesPaginatedList';
import { useProjects } from '../hooks/projects';

interface IssuesProps {
  onSelect?: (issue: Issue) => void
}

export function IssuesSearch(props: IssuesProps) {
  const { onSelect } = props;

  const [query, setQuery] = React.useState('')
  const [projectId, setProjectId] = React.useState<number | undefined>()
  
  const [searchParams, setSearchParams] = React.useState({
    query: "",
    projectId,
  });

  const projects = useProjects() ?? [];
  const [issues, isLoading] = useIssuesSearch(searchParams);

  const search = React.useCallback(
    (event) => {
      event.preventDefault();
      setSearchParams({
        query,
        projectId,
      });
    },
    [setSearchParams, query, projectId]
  );

  return (
    <div>
      <h2>Issues search</h2>
      <form onSubmit={search}>
        <label>
          Query
          <input type="text" value={query} onChange={useOnChange(setQuery)} />
        </label>
        <label>
          Project
          <select value={projectId} onChange={useOnChange(setProjectId)}>
            <option value={0}>Any</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </label>
        <input type="submit" value="Search" />
      </form>
      {issues.length > 0 && (
        <ul>
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} onClick={onSelect} />
          ))}
        </ul>
      )}
      {issues.length === 0 && (
        <>
          {isLoading && <p>Loading...</p>}
          {!isLoading && <p>Nothing found for your query, try something else</p>}
        </>
      )}
    </div>
  );
}