import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ToastItem {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

const ToastContext = createContext<{ notify: (message: string, tone?: ToastItem['tone']) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm shadow-panel',
              item.tone === 'success' ? 'border-ok/25' : 'border-line',
            )}
          >
            <span className={item.tone === 'success' ? 'text-ok' : 'text-navy-mist'}>
              {item.tone === 'success' ? <CheckCircle2 size={17} /> : <Info size={17} />}
            </span>
            <p className="flex-1 text-navy">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-slate-light transition-colors hover:text-navy"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
