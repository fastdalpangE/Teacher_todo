import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, ToastProvider } from './store/app-store';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppProvider>
  </React.StrictMode>
);
