import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { PracticeSessionPage } from '../pages/PracticeSessionPage'
import { PracticeSetupPage } from '../pages/PracticeSetupPage'
import { SessionSummaryPage } from '../pages/SessionSummaryPage'
import type { StorageInitializationReport } from '../services/storage'
import { AppShell } from './layout/AppShell'
import { PageContainer } from './layout/PageContainer'

const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)
const StatisticsPage = lazy(() =>
  import('../pages/StatisticsPage').then((module) => ({
    default: module.StatisticsPage,
  })),
)

interface AppProps {
  storageInitializationReport?: StorageInitializationReport
}

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <PageContainer className="route-loading" aria-live="polite">
          <p>Loading your math space…</p>
        </PageContainer>
      }
    >
      {children}
    </Suspense>
  )
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
        <Route
          path="statistics"
          element={
            <LazyPage>
              <StatisticsPage />
            </LazyPage>
          }
        />
        <Route
          path="settings"
          element={
            <LazyPage>
              <SettingsPage />
            </LazyPage>
          }
        />
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
