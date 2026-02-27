import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((variant, message) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const value = useMemo(
    () => ({
      toasts,
      success: (message) => pushToast('success', message),
      error: (message) => pushToast('danger', message),
      info: (message) => pushToast('info', message),
      removeToast
    }),
    [toasts, pushToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
