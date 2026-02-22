import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import Students from './pages/Students';
import Services from './pages/Services';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Ranking from './pages/Ranking';
import Tickets from './pages/Tickets';
import Onboarding from './pages/Onboarding';
import Subscription from './pages/Subscription';
import InviteActivation from './pages/InviteActivation';

import { api, saveAuth, clearAuth } from './services/api';
import { ToastProvider } from './components/ToastProvider';
import { canAccessRoute } from './utils/access';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trainforge_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  const can = useMemo(() => (routeKey) => canAccessRoute(user, routeKey), [user]);

  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const [billingSummary, setBillingSummary] = useState(null);

  useEffect(() => {
    // Fecha a navegacao no mobile quando troca de rota.
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Evita scroll do body quando o drawer estiver aberto.
    document.body.classList.toggle('tf-no-scroll', navOpen);
    return () => document.body.classList.remove('tf-no-scroll');
  }, [navOpen]);

  useEffect(() => {
    // Carrega resumo do billing (para badge no header e pagina de assinatura).
    if (!user?.tenant_id) return;

    let cancelled = false;
    api.get('/billing/me')
      .then((res) => {
        if (cancelled) return;
        setBillingSummary(res.data?.data || null);
      })
      .catch(() => {
        if (cancelled) return;
        setBillingSummary(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.tenant_id]);

  useEffect(() => {
    if (!navOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navOpen]);

  const onAuth = (authPayload) => {
    setUser(authPayload.user);
    saveAuth(authPayload);
  };

  const onLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // no-op
    } finally {
      setUser(null);
      clearAuth();
    }
  };

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <main className="min-vh-100">
          <Routes>
            <Route path="/login" element={<Login onAuth={onAuth} />} />
            <Route path="/invite" element={<InviteActivation onAuth={onAuth} />} />
            <Route path="/invite/:token" element={<InviteActivation onAuth={onAuth} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className={`tf-shell${navOpen ? ' tf-shell--nav-open' : ''}`}>
        <Sidebar
          user={user}
          onLogout={onLogout}
          isOpen={navOpen}
          onClose={() => setNavOpen(false)}
        />
        {navOpen ? (
          <button
            type="button"
            className="tf-backdrop"
            aria-label="Fechar menu"
            onClick={() => setNavOpen(false)}
          />
        ) : null}
        <div className="tf-content">
          <Header
            user={user}
            billing={billingSummary}
            navOpen={navOpen}
            onToggleNav={() => setNavOpen((v) => !v)}
          />
          <main className="tf-main container-fluid py-4">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/onboarding" element={can('onboarding') ? <Onboarding user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={can('dashboard') ? <Dashboard user={user} /> : <Navigate to="/" replace />} />
              <Route path="/challenges" element={can('challenges') ? <Challenges user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/services" element={can('services') ? <Services user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/students" element={can('students') ? <Students user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/feedback" element={can('feedback') ? <Feedback user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/settings" element={can('settings') ? <Settings user={user} onUserUpdate={setUser} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/subscription" element={can('subscription') ? <Subscription user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/ranking" element={can('ranking') ? <Ranking /> : <Navigate to="/dashboard" replace />} />
              <Route path="/tickets" element={can('tickets') ? <Tickets user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/clients" element={can('clients') ? <Clients user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/payments" element={can('payments') ? <Payments user={user} /> : <Navigate to="/dashboard" replace />} />
              <Route path="/admin" element={can('admin') ? <Admin /> : <Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
