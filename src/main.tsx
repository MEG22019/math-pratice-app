import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './components/App'
import { initializeStorageWithReport } from './services/storage'
import './styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Unable to find the application root element.')
}

const storageInitializationReport = initializeStorageWithReport()

createRoot(rootElement).render(
  <StrictMode>
    <App storageInitializationReport={storageInitializationReport} />
  </StrictMode>,
)
