import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { PracticeSessionPage } from '../pages/PracticeSessionPage'
import { PracticeSetupPage } from '../pages/PracticeSetupPage'
import { SessionSummaryPage } from '../pages/SessionSummaryPage'
import { SettingsPage } from '../pages/SettingsPage'
import { StatisticsPage } from '../pages/StatisticsPage'
import { AppShell } from './layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="practice/setup" element={<PracticeSetupPage />} />
        <Route path="practice/session" element={<PracticeSessionPage />} />
        <Route path="practice/summary" element={<SessionSummaryPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
