"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title: ReactNode;        // ✅ changed from string to ReactNode
    message?: ReactNode;     // ✅ changed from string to ReactNode
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    toast: (options: Omit<Toast, "id">) => string;
    success: (title: ReactNode, message?: ReactNode) => string;   // ✅
    error: (title: ReactNode, message?: ReactNode) => string;     // ✅
    warning: (title: ReactNode, message?: ReactNode) => string;   // ✅
    info: (title: ReactNode, message?: ReactNode) => string;      // ✅
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null);

// ── Icons ──────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
    success: "check_circle",
    error: "cancel",
    warning: "warning",
    info: "info",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; title: string }> = {
    success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: "text-emerald-500",
        title: "text-emerald-800",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-500",
        title: "text-red-800",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-500",
        title: "text-amber-800",
    },
    info: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "text-blue-500",
        title: "text-blue-800",
    },
};

// ── Individual Toast Component ─────────────────────────────────────────────

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: string) => void;
}) {
    const c = COLORS[toast.type];

    return (
        <div
            className={`
                flex items-start gap-3 w-full max-w-sm p-4 rounded-2xl border shadow-lg
                ${c.bg} ${c.border}
                animate-in slide-in-from-right-4 fade-in duration-300
            `}
            style={{ animation: "toastSlideIn 0.3s ease-out" }}
            role="alert"
            aria-live="assertive"
        >
            {/* Icon */}
            <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${c.icon}`}>
                {ICONS[toast.type]}
            </span>

            {/* Body */}
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold leading-snug ${c.title}`}>
                    {toast.title}  {/* ✅ changed <p> to <div> to allow JSX children */}
                </div>
                {toast.message && (
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {toast.message}  {/* ✅ changed <p> to <div> to allow JSX children */}
                    </div>
                )}
            </div>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Dismiss notification"
            >
                <span className="material-symbols-outlined text-base text-slate-400">
                    close
                </span>
            </button>
        </div>
    );
}

// ── Toast Container ────────────────────────────────────────────────────────

function ToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
            aria-label="Notifications"
        >
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

// ── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const dismissAll = useCallback(() => {
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current.clear();
        setToasts([]);
    }, []);

    const toast = useCallback(
        (options: Omit<Toast, "id">): string => {
            const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const duration = options.duration ?? 4000;

            setToasts((prev) => {
                const next = [...prev, { ...options, id }];
                return next.length > 5 ? next.slice(next.length - 5) : next;
            });

            if (duration > 0) {
                const timer = setTimeout(() => dismiss(id), duration);
                timers.current.set(id, timer);
            }

            return id;
        },
        [dismiss]
    );

    // Convenience helpers
    const success = useCallback(
        (title: ReactNode, message?: ReactNode) => toast({ type: "success", title, message }),
        [toast]
    );
    const error = useCallback(
        (title: ReactNode, message?: ReactNode) => toast({ type: "error", title, message, duration: 6000 }),
        [toast]
    );
    const warning = useCallback(
        (title: ReactNode, message?: ReactNode) => toast({ type: "warning", title, message, duration: 5000 }),
        [toast]
    );
    const info = useCallback(
        (title: ReactNode, message?: ReactNode) => toast({ type: "info", title, message }),
        [toast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, toast, success, error, warning, info, dismiss, dismissAll }}
        >
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
