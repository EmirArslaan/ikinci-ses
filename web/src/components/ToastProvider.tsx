'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

/**
 * Global Toast Notification Provider
 * 
 * Add this to your root layout to enable toast notifications throughout the app
 */
export function ToastProvider() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
                // Success
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#FFFFFF',
                    },
                    style: {
                        background: '#ECFDF5',
                        color: '#065F46',
                        border: '1px solid #A7F3D0',
                    },
                },
                // Error
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFFFF',
                    },
                    style: {
                        background: '#FEF2F2',
                        color: '#991B1B',
                        border: '1px solid #FECACA',
                    },
                },
                // Loading
                loading: {
                    iconTheme: {
                        primary: '#3B82F6',
                        secondary: '#FFFFFF',
                    },
                    style: {
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        border: '1px solid #BFDBFE',
                    },
                },
            }}
        />
    );
}

// Utility function for common toast patterns
export { toast } from 'react-hot-toast';

/**
 * Pre-configured toast helpers
 */
export const showToast = {
    success: (message: string) => {
        const { toast } = require('react-hot-toast');
        return toast.success(message);
    },
    error: (message: string) => {
        const { toast } = require('react-hot-toast');
        return toast.error(message);
    },
    loading: (message: string) => {
        const { toast } = require('react-hot-toast');
        return toast.loading(message);
    },
    promise: async <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        const { toast } = require('react-hot-toast');
        return toast.promise(promise, messages);
    },
};
