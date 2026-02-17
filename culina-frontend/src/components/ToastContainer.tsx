"use client";

import { useToast } from '@/utils/toast';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            pointer-events-auto
            min-w-[300px] max-w-md
            px-6 py-4 rounded-lg shadow-lg
            flex items-start gap-3
            animate-slide-in-right
            ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
            ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}
          `}
                >
                    <div className="flex-1">
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-white hover:text-gray-200 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
