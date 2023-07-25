import * as React from 'react'

interface RedmineLinkProps {
  to: string
  fallbackToText?: boolean
  className?: string
}

export function RedmineLink({
  to,
  className = '',
  fallbackToText = false,
  children
}: React.PropsWithChildren<RedmineLinkProps>) {
  const redmineBaseUrl = process.env.REACT_APP_REDMINE_URL
  if (!redmineBaseUrl) {
    if (fallbackToText) {
      return (
        <>
          {children} ({to})
        </>
      )
    }
    return <>children</>
  }
  return (
    <a target='_blank' className={className} href={`${redmineBaseUrl}${to}`}>
      {children}
    </a>
  )
}
