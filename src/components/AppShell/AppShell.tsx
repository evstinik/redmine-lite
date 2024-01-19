import React from 'react'
import { Outlet } from 'react-router-dom'
import { Greetings } from 'components/User/Greetings'

import './AppShell.css'

export interface AppShellProps {}

export const AppShell: React.FC<AppShellProps> = (props) => {
  return (
    <div className='page'>
      <Greetings />
      <div className='page__content'>
        <Outlet />
      </div>
    </div>
  )
}
