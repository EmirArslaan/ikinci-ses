'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error
        console.error('Global application error:', error);
    }, [error]);

    return (
        <html lang="tr">
            <body>
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                    <div className="max-w-md w-full text-center space-y-8">
                        {/* Error Icon */}
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-red-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Kritik Hata
                            </h2>
                            <p className="text-lg text-gray-600">
                                Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen sayfayı yenileyin.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => reset()}
                                className="px-6 py-3 bg-[#8B4513] text-white rounded-full font-bold hover:bg-[#A0522D] transition-colors"
                            >
                                Sayfayı Yenile
                            </button>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-white border-2 border-[#8B4513] text-[#8B4513] rounded-full font-bold hover:bg-[#8B4513] hover:text-white transition-all"
                            >
                                Ana Sayfa
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
