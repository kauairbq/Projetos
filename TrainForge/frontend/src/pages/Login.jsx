import React, { useMemo, useState } from 'react';
import { api } from '../services/api';
import './login.css';

export default function Login({ onAuth }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const canSubmit = useMemo(() => {
    return identifier.trim().length >= 4 && password.length >= 6 && !loading;
  }, [identifier, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    try {
      setLoading(true);

      const { data } = await api.post('/auth/login', {
        email: identifier.trim().toLowerCase(),
        password,
        remember
      });

      if (!data?.ok) {
        throw new Error(data?.error || 'Falha no login.');
      }

      onAuth(data);
      window.location.href = '/dashboard';
    } catch (err) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      if (err?.response?.data?.activation_required) {
        setErrorMsg('Conta pendente de ativacao. Usa o token do convite para ativar.');
      } else {
        setErrorMsg(apiMessage || err?.message || 'Erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onRequestActivation() {
    setErrorMsg('');
    setInfoMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Informa o email para reenviar token.');
      return;
    }

    try {
      const { data } = await api.post('/auth/activation/request', {
        email: identifier.trim().toLowerCase()
      });
      setInfoMsg(data?.message || 'Se o email existir, novo token foi enviado.');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Nao foi possivel reenviar token.');
    }
  }

  function goActivate() {
    window.location.href = '/invite';
  }

  function goForgot() {
    window.location.href = '/forgot-password';
  }

  return (
    <div className="auth-page">
      <div className="star-noise" aria-hidden="true" />
      <div className="auth-shell">
        <img
          className="auth-brand-logo"
          src="/brand/brasao-em-fundo.png"
          alt="Brasao TrainForge"
          draggable="false"
        />
        <section className="auth-card" aria-label="Entrar na plataforma">
          <h2 className="auth-title">Entrar na plataforma</h2>

        {errorMsg ? (
          <div className="auth-alert" role="alert">
            <span className="auth-alert__dot" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {infoMsg ? (
          <div className="auth-alert auth-alert--ok" role="status">
            <span className="auth-alert__dot auth-alert__dot--ok" />
            <span>{infoMsg}</span>
          </div>
        ) : null}

          <form onSubmit={onSubmit}>
          <div className="auth-stack">
            <div>
              <div className="auth-label">Email</div>
              <div className="auth-field">
                <span className="auth-icon" aria-hidden="true">
                  <MailIcon />
                </span>
                <input
                  className="auth-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="usuario@email.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="auth-label">Palavra-passe</div>
              <div className="auth-field">
                <span className="auth-icon" aria-hidden="true">
                  <LockIcon />
                </span>
                <input
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Lembrar de mim</span>
            </label>
            <button type="button" className="auth-link" onClick={goForgot}>
              Esqueci a senha
            </button>
          </div>

          <div className="auth-row auth-row--compact">
            <span className="auth-row__spacer" />
            <button type="button" className="auth-link" onClick={onRequestActivation}>
              Reenviar token
            </button>
          </div>

          <button className="auth-button" disabled={!canSubmit}>
            {loading ? 'A entrar...' : 'ENTRAR'}
          </button>

          <div className="auth-muted">
            Ainda nao tem acesso?{' '}
            <button type="button" className="auth-link" onClick={goActivate}>
              Ativar conta (token convite)
            </button>
          </div>

          <div className="auth-footer">
            <a className="auth-link" href="/privacy">
              Politica de Privacidade
            </a>{' '}
            |{' '}
            <a className="auth-link" href="/terms">
              Termos de Uso
            </a>
          </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.9"
      />
      <path
        d="M6.5 7.2 12 11.3l5.5-4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M7.5 10.3V8.6a4.5 4.5 0 0 1 9 0v1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M6.6 10.3h10.8A1.6 1.6 0 0 1 19 11.9v7.5A1.6 1.6 0 0 1 17.4 21H6.6A1.6 1.6 0 0 1 5 19.4v-7.5a1.6 1.6 0 0 1 1.6-1.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.9"
      />
    </svg>
  );
}
