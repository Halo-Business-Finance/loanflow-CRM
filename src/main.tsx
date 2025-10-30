import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSecurityHeaders, setupCSPReporting } from './lib/content-security-policy'

// Initialize security headers immediately
initializeSecurityHeaders()
setupCSPReporting()

createRoot(document.getElementById("root")!).render(<App />);
