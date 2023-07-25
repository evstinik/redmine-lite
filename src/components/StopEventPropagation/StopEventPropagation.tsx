import * as React from 'react'

export const StopEventPropagation: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...other
}) => (
  <div
    {...other}
    onClick={(event) => {
      event.stopPropagation()
    }}
  >
    {children}
  </div>
)
