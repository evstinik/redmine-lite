import React from 'react'
import classNames from 'classnames'

import './Wiki.css'

export interface WikiProps extends React.PropsWithChildren {
  className?: string
}

export const Wiki: React.FC<WikiProps> = (props) => {
  const { className, children } = props

  return <div className={classNames('wiki', className)}>Wiki page will be here</div>
}
