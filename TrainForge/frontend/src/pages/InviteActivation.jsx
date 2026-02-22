import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function InviteActivation({ onAuth }) {
  const navigate = useNavigate();
  const { token: tokenFromPath } = useParams();
  const [searchParams] = useSearchParams();

  const tenantSlug = searchParams.get('tenant') || '';
  const inviteToken = tokenFromPath || searchParams.get('token') || '';

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    address: '',
    mode: 'online',
    acceptedTerms: false
  });
  const [activationToken, setActivationToken] = useState(inviteToken);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const canRegister = useMemo(() => {
    return (
      registerForm.fullName.trim() &&
      registerForm.email.trim() &&
      registerForm.password.trim().length >= 6 &&
      registerForm.acceptedTerms
    );
  }, [registerForm]);

  const canActivate = useMemo(() => registerForm.email.trim() && activationToken.trim(), [registerForm.email, activationToken]);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!canRegister) {
      setError('Preenche os dados obrigatorios e aceita os termos.');
      return;
    }

    setIsRegistering(true);
    try {
      const payload = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        birthDate: registerForm.birthDate || null,
        address: registerForm.address || null,
        mode: registerForm.mode,
        tenantSlug: tenantSlug || undefined
      };
      const { data } = await api.post('/auth/register', payload);
      setInfo(data?.message || 'Pre-cadastro concluido. Verifica o token e ativa a conta.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Nao foi possivel concluir o pre-cadastro.');
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleActivate() {
    setError('');
    setInfo('');
    if (!canActivate) {
      setError('Informa email e token.');
      return;
    }

    setIsActivating(true);
    try {
      const { data } = await api.post('/auth/activation/verify', {
        email: registerForm.email,
        token: activationToken
      });
      setInfo(data?.message || 'Conta ativada com sucesso. A iniciar sessao...');
      await autoLogin();
    } catch (err) {
      setError(err?.response?.data?.message || 'Token invalido ou expirado.');
    } finally {
      setIsActivating(false);
    }
  }

  async function handleRequestToken() {
    setError('');
    setInfo('');
    if (!registerForm.email.trim()) {
      setError('Informa o email para solicitar novo token.');
      return;
    }
    try {
      const { data } = await api.post('/auth/activation/request', { email: registerForm.email });
      setInfo(data?.message || 'Novo token enviado.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Nao foi possivel solicitar novo token.');
    }
  }

  async function autoLogin() {
    if (!registerForm.email || !registerForm.password) {
      navigate('/login', { replace: true });
      return;
    }

    setIsLoggingIn(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: registerForm.email,
        password: registerForm.password
      });
      if (data?.ok) {
        onAuth(data);
      } else {
        navigate('/login', { replace: true });
      }
    } catch {
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050a18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.30),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.18),transparent_40%),radial-gradient(circle_at_30%_80%,rgba(99,102,241,0.24),transparent_45%)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <img src="/brand/brasao.png" alt="TrainForge" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-sm text-white/80">Ativacao por convite - TrainForge</span>
          </div>
          <Link to="/login" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:text-white">
            Voltar ao login
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <h1 className="text-2xl font-semibold">Formulario de convite</h1>
            <p className="mt-2 text-sm text-white/65">
              Preenche os teus dados para concluir o onboarding. O acesso e apenas por convite.
            </p>
            {tenantSlug ? (
              <p className="mt-2 text-xs text-amber-200/90">Tenant vinculado: {tenantSlug}</p>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <Input
                label="Nome completo"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nome e apelido"
              />
              <Input
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="teu@email.com"
              />
              <Input
                label="Palavra-passe"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimo 6 caracteres"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Data de nascimento"
                  type="date"
                  value={registerForm.birthDate}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-white/70">Modalidade</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
                    value={registerForm.mode}
                    onChange={(e) => setRegisterForm((prev) => ({ ...prev, mode: e.target.value }))}
                  >
                    <option value="online" className="bg-[#0b1020]">Online</option>
                    <option value="presencial" className="bg-[#0b1020]">Presencial</option>
                  </select>
                </label>
              </div>
              <Input
                label="Morada"
                value={registerForm.address}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Cidade, pais"
              />

              <label className="flex items-start gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={registerForm.acceptedTerms}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, acceptedTerms: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-amber-400 focus:ring-2 focus:ring-amber-400/40"
                />
                Confirmo os termos e consentimento de dados (RGPD).
              </label>

              <button
                type="submit"
                disabled={!canRegister || isRegistering}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 px-5 py-3.5 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegistering ? 'A processar...' : 'Concluir pre-cadastro'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Ativar conta com token</h2>
            <p className="mt-2 text-sm text-white/65">
              Usa o token recebido por email para ativar o acesso ao painel.
            </p>

            <div className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="teu@email.com"
              />
              <Input
                label="Token de ativacao"
                value={activationToken}
                onChange={(e) => setActivationToken(e.target.value)}
                placeholder="Codigo de 6 digitos"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={!canActivate || isActivating}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 px-5 py-3.5 font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActivating ? 'A validar...' : 'Ativar conta'}
                </button>
                <button
                  type="button"
                  onClick={handleRequestToken}
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 font-semibold text-white/80 transition hover:text-white"
                >
                  Reenviar token
                </button>
              </div>

              {isLoggingIn ? (
                <div className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-4 py-3 text-sm text-blue-100">
                  Conta ativada. A entrar...
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {error ? <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {info ? <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{info}</div> : null}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/70">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20"
      />
    </label>
  );
}
