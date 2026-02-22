import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

function iconFor(type) {
  switch (type) {
    case 'success':
      return <FiCheckCircle />;
    case 'error':
      return <FiAlertTriangle />;
    default:
      return <FiInfo />;
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ type = 'info', title = '', message = '', timeoutMs = 3500 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = { id, type, title, message };

      setToasts((prev) => [toast, ...prev].slice(0, 4));

      if (timeoutMs > 0) {
        window.setTimeout(() => dismiss(id), timeoutMs);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="tf-toast-viewport" aria-live="polite" aria-relevant="additions removals">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`tf-toast tf-toast--${t.type}`}
              role="status"
            >
              <div className="tf-toast__icon">{iconFor(t.type)}</div>
              <div className="tf-toast__body">
                {t.title ? <div className="tf-toast__title">{t.title}</div> : null}
                {t.message ? <div className="tf-toast__message">{t.message}</div> : null}
              </div>
              <button className="tf-toast__close" type="button" onClick={() => dismiss(t.id)} aria-label="Fechar">
                <FiX />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

