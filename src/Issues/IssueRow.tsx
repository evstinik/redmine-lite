import * as React from 'react'
import { Issue } from '../models/api/Issue';

interface IssueRowProps {
  onClick?: (issue: Issue) => void
  issue: Issue
}

export function IssueRow(props: IssueRowProps) {
  const { issue, onClick } = props
  const { id, author, project, subject } = issue

  const handleClick = React.useCallback(() => {
    onClick?.(issue)
  }, [onClick, issue])

  return (
    <li onClick={handleClick}>
      <div>
        #{id} - {subject}
      </div>
      <div>
        {project.name} ({author.name})
      </div>
    </li>
  );
}