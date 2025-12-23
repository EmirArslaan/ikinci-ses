'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to error reporting service
        console.error('Application error:', error);

        // In production, you would send this to a service like Sentry
        // if (process.env.NODE_ENV === 'production') {
        //   Sentry.captureException(error);
        // }
    }, [error]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Error Icon */}
                <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[80px] text-red-600">
                            error
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Bir Şeyler Yanlış Gitti
                    </h2>
                    <p className="text-lg text-gray-600">
                        Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                            <p className="text-sm font-mono text-red-800 break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-red-600 mt-2">
                                    Hata ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-[#8B4513] text-white rounded-full font-bold hover:bg-[#A0522D] transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Tekrar Dene
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white border-2 border-[#8B4513] text-[#8B4513] rounded-full font-bold hover:bg-[#8B4513] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfa
                    </Link>
                </div>

                {/* Help Text */}
                <div className="pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Sorun devam ederse, lütfen{' '}
                        <Link href="mailto:support@ikincises.com" className="text-[#8B4513] hover:underline font-medium">
                            destek ekibimizle
                        </Link>{' '}
                        iletişime geçin.
                    </p>
                </div>
            </div>
        </div>
    );
}
