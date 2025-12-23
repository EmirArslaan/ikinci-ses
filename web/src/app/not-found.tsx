'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Illustration */}
                <div className="relative">
                    <h1 className="text-[150px] font-extrabold text-[#8B4513] opacity-10 leading-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[120px] text-[#8B4513]">
                            music_off
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Sayfa Bulunamadı
                    </h2>
                    <p className="text-lg text-gray-600">
                        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-white border-2 border-[#8B4513] text-[#8B4513] rounded-full font-bold hover:bg-[#8B4513] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Geri Dön
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-[#8B4513] text-white rounded-full font-bold hover:bg-[#A0522D] transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Ana Sayfa
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Popüler Sayfalar:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link
                            href="/listings"
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                            İlanlar
                        </Link>
                        <Link
                            href="/questions"
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                            Sorular
                        </Link>
                        <Link
                            href="/meetups"
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                            Buluşmalar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
