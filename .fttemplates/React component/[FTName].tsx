import React from 'react'

export interface <FTName | capitalize>Props extends React.PropsWithChildren {
  className?: string
}

export const <FTName | capitalize>: React.FC<<FTName | capitalize>Props> = (props) => {
  const { className, children } = props

  return (
    <div className={className}>
      {children}
    </div>
  )
}