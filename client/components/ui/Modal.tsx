"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    /** Controls max width. Defaults to "md" */
    size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    size = "md",
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Prevent body scroll while open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                // Close when clicking the backdrop (not the modal itself)
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div
                className={`
                    w-full ${SIZE_CLASSES[size]} bg-white rounded-[1.75rem]
                    shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4
                    duration-300 overflow-hidden
                `}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-4 sm:px-8 pt-8 pb-5 border-b border-slate-100">
                    <div>
                        <h2 className="font-display text-xl font-bold text-slate-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="size-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0 mt-0.5"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 sm:px-8 py-6">{children}</div>
            </div>
        </div>
    );
}
