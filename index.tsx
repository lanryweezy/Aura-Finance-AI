
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { CurrencyProvider } from './components/ui/CurrencyProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
          <CurrencyProvider>
              <ToastProvider>
                  <App />
              </ToastProvider>
          </CurrencyProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
