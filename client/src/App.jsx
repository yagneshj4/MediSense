import { useLocation } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar    from './components/Sidebar';
import Home      from './pages/Home';
import Auth      from './pages/Auth';
import Predict   from './pages/Predict';
import Chat      from './pages/Chat';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function PageWrapper({ children }) {
  const { pathname } = useLocation();
  if (pathname === '/auth') return <>{children}</>;
  if (pathname === '/chat') return <div className="page-full">{children}</div>;
  return <div className="page-wrap">{children}</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Routes>
                <Route path="/"          element={<PageWrapper><Home /></PageWrapper>}      />
                <Route path="/auth"      element={<PageWrapper><Auth /></PageWrapper>}      />
                <Route path="/predict"  element={<PageWrapper><Predict /></PageWrapper>}   />
                <Route path="/chat"     element={<PageWrapper><Chat /></PageWrapper>}      />
                <Route path="/dashboard"element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="*"         element={<PageWrapper><Home /></PageWrapper>}      />
              </Routes>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style:{
                background:'#0d1628',color:'#eaf2ff',
                border:'1px solid rgba(0,212,255,0.2)',
                borderRadius:'14px',fontFamily:'Inter,sans-serif',
                fontSize:'.875rem',boxShadow:'0 8px 32px rgba(0,0,0,.5)',
              },
              success:{iconTheme:{primary:'#10b981',secondary:'#0d1628'}},
              error:  {iconTheme:{primary:'#ef4444',secondary:'#0d1628'}},
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
