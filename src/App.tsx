import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { ToastProvider } from './app/providers/ToastProvider';
import { AppRouter } from './app/router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
};

export default App;
