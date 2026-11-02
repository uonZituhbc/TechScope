
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'
import './App.css'

// Register TechScope Progressive Web App
registerSW({
  immediate: true,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/TechScope">
      <App />
    </BrowserRouter>
  </StrictMode>,
)