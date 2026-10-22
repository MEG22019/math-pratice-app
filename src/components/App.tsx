import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { PracticeSessionPage } from '../pages/PracticeSessionPage'
import { PracticeSetupPage } from '../pages/PracticeSetupPage'
import { SessionSummaryPage } from '../pages/SessionSummaryPage'
import { SettingsPage } from '../pages/SettingsPage'
import { StatisticsPage } from '../pages/StatisticsPage'
import type { StorageInitializationReport } from '../services/storage'
import { AppShell } from './layout/AppShell'

interface AppProps {
  storageInitializationReport?: StorageInitializationReport
}

export function AppRoutes({ storageInitializationReport }: AppProps = {}) {
  return (
    <Routes>
      <Route
        element={
          <AppShell storageInitializationReport={storageInitializationReport} />
        }
      >
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

export function App({ storageInitializationReport }: AppProps) {
  return (
    <BrowserRouter>
      <AppRoutes storageInitializationReport={storageInitializationReport} />
    </BrowserRouter>
  )
}
