import React from 'react'
import classNames from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useRedmineService } from 'hooks/redmineService'
import { useApiKey } from 'hooks/apiKey'

import './Wiki.css'

export interface WikiProps extends React.PropsWithChildren {
  className?: string
}

export const Wiki: React.FC<WikiProps> = (props) => {
  const { className, children } = props

  const { projectId = '', wikiPageId = '' } = useParams<{ projectId: string; wikiPageId: string }>()

  const redmineService = useRedmineService()
  const apiKey = useApiKey()
  const { isLoading, data: wikiPage } = useQuery({
    queryKey: ['wiki', projectId, wikiPageId],
    queryFn: () => redmineService.getWikiPage(projectId, wikiPageId, apiKey!)
  })

  return (
    <div className={classNames('wiki page__content__fixed-panel', className)}>
      <pre>{wikiPage?.text}</pre>
    </div>
  )
}
