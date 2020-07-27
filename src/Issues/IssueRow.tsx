import * as React from 'react'
import { Issue } from '../models/api/Issue';
import './IssueRow.css'

interface IssueRowProps {
  onClick?: (issue: Issue) => void
  issue: Issue
}

export function IssueRow(props: IssueRowProps) {
  const { issue, onClick } = props
  const { id, author, project, subject, description } = issue

  const handleClick = React.useCallback(() => {
    onClick?.(issue)
  }, [onClick, issue])

  return (
    <li className="issue-row">
      <div className="line">
        <span className="id hours active" onClick={handleClick}>
          #{id}
        </span>
        <span className="subject">{subject}</span>
        <span className="project">{project.name}</span>
      </div>
      <p className="line description">{description}</p>
      <div className="line">
        <span className="author">{author.name}</span>
      </div>
    </li>
  );
}