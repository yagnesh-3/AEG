import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { AuthProvider } from '@/store/AuthContext';
import { DataProvider } from '@/store/DataContext';
import { ToastProvider } from '@/components/ui';
import '@/styles/theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
