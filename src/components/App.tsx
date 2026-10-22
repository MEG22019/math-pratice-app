import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { PracticeSessionPage } from '../pages/PracticeSessionPage'
import { PracticeSetupPage } from '../pages/PracticeSetupPage'
import { SessionSummaryPage } from '../pages/SessionSummaryPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { AppShell } from './layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="practice/setup" element={<PracticeSetupPage />} />
        <Route path="practice/session" element={<PracticeSessionPage />} />
        <Route path="practice/summary" element={<SessionSummaryPage />} />
        <Route
          path="statistics"
          element={
            <PlaceholderPage
              eyebrow="Watch your skills grow"
              title="Statistics"
              description="Your practice streaks, accuracy, and math progress will be collected here."
              symbol="📈"
            />
          }
        />
        <Route
          path="settings"
          element={
            <PlaceholderPage
              eyebrow="Make it yours"
              title="Settings"
              description="Soon you’ll be able to adjust sounds, animations, explanations, and practice defaults."
              symbol="⚙️"
            />
          }
        />
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
