// Toast notification utility for displaying user feedback
import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
    const toast: Toast = {
        id: Date.now().toString() + Math.random(),
        message,
        type,
    };

    toastListeners.forEach(listener => listener(toast));
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const listener = (toast: Toast) => {
            setToasts(prev => [...prev, toast]);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 5000);
        };

        toastListeners.push(listener);

        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, removeToast };
}
