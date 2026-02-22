import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiChevronDown, FiMenu, FiUser, FiX } from 'react-icons/fi';

import { canAccessRoute } from '../utils/access';

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || 'T';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

export default function Header({ user, billing = null, navOpen = false, onToggleNav = () => {} }) {
  const displayName = user.full_name || user.name || 'Utilizador';
  const roleText = useMemo(() => {
    if (user?.tenant_role === 'MASTER_ADMIN') return 'Admin Master';
    if (user?.tenant_role === 'GYM_STAFF') return 'Staff do Ginasio';
    if (user?.tenant_role === 'PERSONAL') return 'Personal Trainer';
    if (user?.role === 'admin') return 'Administrador';
    if (user?.role === 'trainer') return 'Operacao';
    return 'Cliente';
  }, [user?.role, user?.tenant_role]);

  const subscriptionBadge = useMemo(() => {
    const planName = billing?.plan?.name;
    const status = billing?.subscription?.status;
    if (planName && status) return `${planName} · ${status}`;
    if (user.tenant_slug === 'trainforge-internal') return 'Demo';
    return 'Trial';
  }, [billing, user.tenant_slug]);

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="tf-header d-flex align-items-center justify-content-between px-4 py-3">
      <div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <h1 className="tf-title m-0">TrainForge</h1>
          <span className="tf-pill" title="Produto SaaS">SaaS Platform</span>
        </div>
        <small className="text-secondary">Forjando performance e resultados</small>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        <button
          className="btn btn-outline-light btn-sm tf-nav-toggle"
          type="button"
          aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={navOpen}
          onClick={onToggleNav}
        >
          {navOpen ? <FiX /> : <FiMenu />}
        </button>

        <button className="btn btn-outline-light btn-sm" type="button" aria-label="Notificações">
          <FiBell />
        </button>

        <span className="tf-badge" title="Estado da assinatura">
          Plano: {subscriptionBadge}
        </span>

        <div className="tf-dropdown" ref={menuRef}>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="tf-avatar" aria-hidden="true">{initials(displayName)}</span>
            <span className="d-none d-md-inline text-truncate" style={{ maxWidth: 180 }}>{displayName}</span>
            <FiChevronDown aria-hidden="true" />
          </button>

          {open ? (
            <div className="tf-dropdown-menu" role="menu">
              <div className="tf-dropdown-head">
                <div className="tf-dropdown-name">{displayName}</div>
                <div className="tf-dropdown-sub">{roleText}{user.tenant_slug ? ` · ${user.tenant_slug}` : ''}</div>
              </div>

              {canAccessRoute(user, 'settings') ? (
                <Link className="tf-dropdown-item" to="/settings" onClick={() => setOpen(false)}>
                  <FiUser /> Area do cliente
                </Link>
              ) : null}
              {canAccessRoute(user, 'subscription') ? (
                <Link className="tf-dropdown-item" to="/subscription" onClick={() => setOpen(false)}>
                  Plano e assinatura
                </Link>
              ) : null}
              {canAccessRoute(user, 'onboarding') ? (
                <Link className="tf-dropdown-item" to="/onboarding" onClick={() => setOpen(false)}>
                  Onboarding
                </Link>
              ) : null}
              {canAccessRoute(user, 'tickets') ? (
                <Link className="tf-dropdown-item" to="/tickets" onClick={() => setOpen(false)}>
                  Tickets
                </Link>
              ) : null}
              {canAccessRoute(user, 'feedback') ? (
                <Link className="tf-dropdown-item" to="/feedback" onClick={() => setOpen(false)}>
                  Feedback
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
