import { NavLink } from 'react-router-dom';
import {
  FiBarChart2,
  FiCompass,
  FiFlag,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiBriefcase,
  FiShield,
  FiCreditCard,
  FiLayers,
  FiTrendingUp,
  FiLifeBuoy,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { canAccessRoute } from '../utils/access';

export default function Sidebar({ user, onLogout, isOpen = false, onClose = () => {} }) {
  const role = user?.role || 'client';

  const close = () => onClose();

  const onLogoutClick = async () => {
    await onLogout?.();
    close();
  };

  return (
    <aside className="tf-sidebar p-3">
      <div className="tf-sidebar__top mb-3">
        <div className="tf-brand" aria-label="TrainForge">
          <img className="tf-brand__img" src="/brand/brasao.png" alt="TrainForge" />
        </div>
        <button
          className="btn btn-outline-light btn-sm tf-sidebar__close"
          type="button"
          aria-label="Fechar menu"
          onClick={close}
        >
          <FiX />
        </button>
      </div>

      <div className="mb-4">
        <div className="fw-bold">TrainForge</div>
        <small className="text-secondary">SaaS Platform</small>
      </div>

      <nav className="d-flex flex-column gap-2">
        {canAccessRoute(user, 'dashboard') ? (
          <NavLink to="/dashboard" className="tf-link" onClick={close}>
            <FiBarChart2 /> Dashboard
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'clients') ? (
          <>
            <NavLink to="/clients" className="tf-link" onClick={close}>
              <FiLayers /> Clientes
            </NavLink>
            <NavLink to="/payments" className="tf-link" onClick={close}>
              <FiCreditCard /> Pagamentos
            </NavLink>
            <NavLink to="/tickets" className="tf-link" onClick={close}>
              <FiLifeBuoy /> Tickets
            </NavLink>
            <NavLink to="/subscription" className="tf-link" onClick={close}>
              <FiCreditCard /> Plano e assinatura
            </NavLink>
          </>
        ) : null}

        {canAccessRoute(user, 'onboarding') ? (
          <>
            <NavLink to="/onboarding" className="tf-link" onClick={close}>
              <FiCompass /> Onboarding
            </NavLink>
          </>
        ) : null}

        {canAccessRoute(user, 'ranking') ? (
          <NavLink to="/ranking" className="tf-link" onClick={close}>
            <FiTrendingUp /> Ranking
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'challenges') ? (
          <NavLink to="/challenges" className="tf-link" onClick={close}>
            <FiFlag /> Desafios
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'services') ? (
          <NavLink to="/services" className="tf-link" onClick={close}>
            <FiBriefcase /> Servicos
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'students') ? (
          <NavLink to="/students" className="tf-link" onClick={close}>
            <FiUsers /> Alunos
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'tickets') ? (
          <NavLink to="/tickets" className="tf-link" onClick={close}>
            <FiLifeBuoy /> Tickets
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'feedback') ? (
          <NavLink to="/feedback" className="tf-link" onClick={close}>
            <FiMessageSquare /> Feedback
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'settings') ? (
          <NavLink to="/settings" className="tf-link" onClick={close}>
            <FiSettings /> Area do cliente
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'subscription') && !canAccessRoute(user, 'clients') ? (
          <NavLink to="/subscription" className="tf-link" onClick={close}>
            <FiCreditCard /> Plano e assinatura
          </NavLink>
        ) : null}

        {canAccessRoute(user, 'admin') ? (
          <>
            <div className="tf-nav-divider mt-2" />
            <NavLink to="/admin" className="tf-link" onClick={close}>
              <FiShield /> Admin
            </NavLink>
          </>
        ) : null}
      </nav>

      <div className="mt-auto pt-4 d-grid gap-2">
        <button className="tf-link tf-link--button" type="button" onClick={onLogoutClick}>
          <FiLogOut /> Logout
        </button>
        <div className="text-secondary">
          <small>Papel atual: {role}</small>
        </div>
      </div>
    </aside>
  );
}
