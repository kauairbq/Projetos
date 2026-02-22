import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { api } from '../services/api';

const schema = Yup.object({
  email: Yup.string().email('Email invalido').required('Obrigatorio'),
  password: Yup.string().min(6, 'Minimo de 6 caracteres').required('Obrigatorio')
});

export default function Home({ onAuth }) {
  const [activation, setActivation] = useState({ email: '', token: '' });
  const [activationStatus, setActivationStatus] = useState('');
  const [activationError, setActivationError] = useState('');

  const onRequestToken = async () => {
    setActivationStatus('');
    setActivationError('');

    if (!activation.email) {
      setActivationError('Informe o email para solicitar token.');
      return;
    }

    try {
      const { data } = await api.post('/auth/activation/request', { email: activation.email });
      const debugToken = data?.activation?.debug_token;
      setActivationStatus(debugToken ? `Token enviado. Codigo de debug: ${debugToken}` : (data?.message || 'Token enviado.'));
    } catch (err) {
      setActivationError(err?.response?.data?.error || err.message || 'Falha ao solicitar token.');
    }
  };

  const onVerifyToken = async () => {
    setActivationStatus('');
    setActivationError('');

    if (!activation.email || !activation.token) {
      setActivationError('Informe email e token para ativar a conta.');
      return;
    }

    try {
      const { data } = await api.post('/auth/activation/verify', {
        email: activation.email,
        token: activation.token
      });
      setActivationStatus(data?.message || 'Conta ativada com sucesso.');
    } catch (err) {
      setActivationError(err?.response?.data?.error || err.message || 'Falha ao validar token.');
    }
  };

  return (
    <div className="tf-auth min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card p-4 tf-auth-card">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="tf-brand" style={{ width: 56, height: 56 }}>
            <img className="tf-brand__img" src="/brand/brasao.png" alt="TrainForge" />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h2 className="mb-0">TrainForge</h2>
              <span className="tf-pill">SaaS Platform</span>
            </div>
            <p className="text-secondary mb-0">Login com ativacao por token de email</p>
          </div>
        </div>

        <Formik
          initialValues={{ email: 'kauai_lucas@hotmail.com', password: 'Y@03K@10Do18@' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              const { data } = await api.post('/auth/login', values);
              if (!data?.ok) {
                throw new Error(data?.error || 'Falha no login');
              }
              onAuth(data);
            } catch (err) {
              const apiData = err?.response?.data;
              if (apiData?.activation_required) {
                setActivation((prev) => ({ ...prev, email: apiData.email || values.email }));
              }
              setStatus(apiData?.error || err.message || 'Erro ao autenticar');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="d-grid gap-3">
              <div>
                <label className="form-label">Email</label>
                <Field className="form-control" name="email" type="email" />
                <small className="text-danger"><ErrorMessage name="email" /></small>
              </div>
              <div>
                <label className="form-label">Password</label>
                <Field className="form-control" name="password" type="password" />
                <small className="text-danger"><ErrorMessage name="password" /></small>
              </div>
              {status ? <div className="alert alert-danger py-2">{status}</div> : null}
              <button className="btn btn-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'A entrar...' : 'Entrar'}
              </button>
            </Form>
          )}
        </Formik>

        <hr className="my-4" />

        <div className="d-grid gap-2">
          <h6 className="mb-1">Ativar conta com token</h6>
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={activation.email}
            onChange={(e) => setActivation({ ...activation, email: e.target.value })}
          />
          <input
            className="form-control"
            type="text"
            placeholder="Token de 6 digitos"
            value={activation.token}
            onChange={(e) => setActivation({ ...activation, token: e.target.value })}
          />
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-light" type="button" onClick={onRequestToken}>
              Solicitar token
            </button>
            <button className="btn btn-primary" type="button" onClick={onVerifyToken}>
              Validar token
            </button>
          </div>
          {activationStatus ? <div className="alert alert-info py-2 mb-0">{activationStatus}</div> : null}
          {activationError ? <div className="alert alert-danger py-2 mb-0">{activationError}</div> : null}
          <small className="text-secondary">
            Master: kauai_lucas@hotmail.com | Gym teste: ginasio_x@trainforge.com | Personal teste: personal_x@trainforge.com
          </small>
        </div>
      </div>
    </div>
  );
}
