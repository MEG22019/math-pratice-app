import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { AppShell } from './layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route
          path="practice/setup"
          element={
            <PlaceholderPage
              eyebrow="Choose your challenge"
              title="Practice Setup"
              description="Soon you’ll be able to pick your math operations, difficulty, and practice length here."
              symbol="✏️"
            />
          }
        />
        <Route
          path="practice/session"
          element={
            <PlaceholderPage
              eyebrow="Let’s solve it"
              title="Practice Session"
              description="Your interactive question cards will appear here once practice is ready."
              symbol="🧠"
            />
          }
        />
        <Route
          path="practice/summary"
          element={
            <PlaceholderPage
              eyebrow="Great effort"
              title="Session Summary"
              description="After a practice session, this page will celebrate your progress and show your results."
              symbol="🏆"
            />
          }
        />
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
