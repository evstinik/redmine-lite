import React from 'react'
import classNames from 'classnames'

import './<FTName>.css'

export interface <FTName | capitalize>Props extends React.PropsWithChildren {
  className?: string
}

export const <FTName | capitalize>: React.FC<<FTName | capitalize>Props> = (props) => {
  const { className, children } = props

  return (
    <div className={classNames('<FTName | kebabcase>', className)}>
      {children}
    </div>
  )
}