import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg bg-white transition-all transform animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'border-emerald-200 text-slate-800'
                : isError
                ? 'border-rose-200 text-slate-800'
                : isWarning
                ? 'border-amber-200 text-slate-800'
                : 'border-blue-200 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 leading-none mb-1">{toast.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-1 rounded"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
