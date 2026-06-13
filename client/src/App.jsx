import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Home      from './pages/Home';
import Auth      from './pages/Auth';
import Predict   from './pages/Predict';
import Chat      from './pages/Chat';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Sidebar />
            <main className="app-main">
              <div className="page-content">
                <Routes>
                  <Route path="/"          element={<Home />}      />
                  <Route path="/auth"       element={<Auth />}      />
                  <Route path="/predict"   element={<Predict />}   />
                  <Route path="/chat"      element={<Chat />}      />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="*"          element={<Home />}      />
                </Routes>
              </div>
            </main>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f1b2d',
                color: '#e8f4f8',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#00e676', secondary: '#0f1b2d' } },
              error:   { iconTheme: { primary: '#ff4757', secondary: '#0f1b2d' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
