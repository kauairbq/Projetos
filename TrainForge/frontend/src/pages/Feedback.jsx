import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { api } from '../services/api';
import { useToast } from '../components/ToastProvider';

const schema = Yup.object({
  subject: Yup.string().required('Obrigatorio'),
  message: Yup.string().min(8, 'Minimo 8 caracteres').required('Obrigatorio'),
  rating: Yup.number().min(1).max(5).required('Obrigatorio')
});

export default function Feedback({ user }) {
  const toast = useToast();

  return (
    <section className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="card tf-card">
          <div className="card-body">
            <h3>Feedback dos alunos</h3>
            <p className="text-secondary">Envie observacoes para o personal e para a equipa administrativa.</p>

            <Formik
              initialValues={{ subject: 'Feedback da semana', message: '', rating: 5 }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  const { data } = await api.post('/feedback', values);
                  if (!data?.ok) throw new Error(data?.error || 'Falha no envio');

                  toast.push({
                    type: 'success',
                    title: 'Feedback enviado',
                    message: 'Obrigado. A equipa foi notificada.'
                  });
                  resetForm();
                } catch (err) {
                  toast.push({
                    type: 'error',
                    title: 'Erro ao enviar',
                    message: err?.response?.data?.error || err.message || 'Erro ao enviar feedback'
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="d-grid gap-3">
                  <div>
                    <label className="form-label">Assunto</label>
                    <Field className="form-control" name="subject" />
                    <small className="text-danger"><ErrorMessage name="subject" /></small>
                  </div>
                  <div>
                    <label className="form-label">Mensagem</label>
                    <Field as="textarea" rows="4" className="form-control" name="message" />
                    <small className="text-danger"><ErrorMessage name="message" /></small>
                  </div>
                  <div>
                    <label className="form-label">Classificacao</label>
                    <Field as="select" className="form-select" name="rating">
                      <option value={5}>5</option>
                      <option value={4}>4</option>
                      <option value={3}>3</option>
                      <option value={2}>2</option>
                      <option value={1}>1</option>
                    </Field>
                    <small className="text-danger"><ErrorMessage name="rating" /></small>
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'A enviar...' : 'Enviar feedback'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card tf-card h-100">
          <div className="card-body">
            <h5>Resumo</h5>
            <ul className="text-secondary mb-0">
              <li>Utilizador: {user.full_name}</li>
              <li>Papel: {user.role}</li>
              <li>Canal: web app</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
