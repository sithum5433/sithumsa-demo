import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function ToastBanner({ toast, onDismiss }) {
  if (!toast) return null;
  const isError = toast.type === 'error';

  return (
    <div className="no-print fixed inset-x-3 bottom-20 z-50 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md animate-[fadeIn_0.2s_ease-out]">
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md ${
          isError
            ? 'border-rose-300 bg-rose-950/95 text-rose-50'
            : 'border-emerald-300/40 bg-slate-900/95 text-white'
        }`}
      >
        {isError ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        )}
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
