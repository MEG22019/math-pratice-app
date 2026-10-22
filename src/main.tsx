import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './components/App'
import { initializeStorage } from './services/storage'
import './styles/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Unable to find the application root element.')
}

initializeStorage()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
