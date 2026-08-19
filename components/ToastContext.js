'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  confirm: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      message,
      type = 'info',
      duration = 3200,
      icon = null,
      actionLabel = null,
      onAction = null,
    }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast = {
        id,
        title,
        message: typeof message === 'string' ? message : '',
        type,
        icon,
        actionLabel,
        onAction,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message, title = 'Success') => {
      return showToast({ title, message, type: 'success' });
    },
    [showToast]
  );

  const showError = useCallback(
    (message, title = 'Error') => {
      return showToast({ title, message, type: 'danger' });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, title = 'Notice') => {
      return showToast({ title, message, type: 'info' });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, title = 'Warning') => {
      return showToast({ title, message, type: 'warning' });
    },
    [showToast]
  );

  const confirm = useCallback(
    ({
      title = 'Confirm action',
      message = 'Are you sure you want to proceed?',
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      isDanger = true,
      onConfirm = () => {},
      onCancel = () => {},
    }) => {
      setConfirmDialog({
        title,
        message,
        confirmLabel,
        cancelLabel,
        isDanger,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog(null);
        },
        onCancel: () => {
          onCancel();
          setConfirmDialog(null);
        },
      });
    },
    []
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        confirm,
      }}
    >
      {children}

      {/* Floating In-App Toast Notifications */}
      <div
        aria-live="polite"
        aria-label="In-app notifications"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none max-w-md w-full px-4"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isDanger = t.type === 'danger';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className="pointer-events-auto w-full max-w-sm flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-[#222225]/95 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl shadow-black/10 text-neutral-800 dark:text-neutral-100 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : isDanger
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {t.icon ? (
                    t.icon
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isDanger ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  {t.message ? (
                    <p className="font-medium truncate text-neutral-800 dark:text-neutral-200">
                      {t.message}
                    </p>
                  ) : (
                    <p className="font-medium truncate text-neutral-800 dark:text-neutral-200">
                      {t.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {t.actionLabel && t.onAction && (
                  <button
                    onClick={() => {
                      t.onAction();
                      removeToast(t.id);
                    }}
                    className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 font-semibold text-[11px] text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
                  >
                    {t.actionLabel}
                  </button>
                )}
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-App Confirmation Modal Dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={confirmDialog.onCancel}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-[#222225] border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDanger
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                }`}
              >
                {confirmDialog.isDanger ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                autoFocus
                onClick={confirmDialog.onCancel}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-medium text-white shadow-xs transition cursor-pointer ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:opacity-90'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
