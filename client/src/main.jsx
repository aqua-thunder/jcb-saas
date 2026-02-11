import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './store/auth.jsx'
import { ToastProvider } from './store/ToastContext.jsx'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ToastProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ToastProvider>
  </AuthProvider>
)
