import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

import { TimeTracking } from './pages/TimeTracking'
import { AppShell } from '@app/components/AppShell'
import { Wiki } from '@app/pages/Wiki'

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path='/' element={<AppShell />}>
      <Route path='time-tracking' element={<TimeTracking />} />
      <Route path='projects/:projectId/wiki/:wikiPageId' element={<Wiki />} />
      <Route index element={<Navigate to='time-tracking' replace />} />
      <Route path='*' element={<Navigate to='time-tracking' replace />} />
    </Route>
  </Routes>
)
