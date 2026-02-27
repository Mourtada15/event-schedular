import { useToast } from '../context/ToastContext.jsx';

export default function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show align-items-center text-bg-${toast.variant} border-0 mb-2`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
