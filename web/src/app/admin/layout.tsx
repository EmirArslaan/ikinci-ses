"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/auth/login");
            } else if (user?.role !== "ADMIN") {
                router.push("/");
            } else {
                setTimeout(() => setIsAuthorized(true), 0);
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-[#8B4513] text-xl font-medium">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
                <div className="flex items-center gap-3 p-6 border-b border-gray-100">
                    <div className="size-8 text-[#8B4513]">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#8B4513] rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Genel Bakış
                    </Link>
                    <Link
                        href="/admin/listings"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#8B4513] rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">inventory_2</span>
                        İlan Yönetimi
                    </Link>
                    <Link
                        href="/admin/questions"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-purple-500 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">help</span>
                        Soru Yönetimi
                    </Link>
                    <Link
                        href="/admin/meetups"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-pink-500 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined">groups</span>
                        Müzisyen Buluşmaları
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#8B4513] rounded-xl transition-colors mt-8"
                    >
                        <span className="material-symbols-outlined">home</span>
                        Siteye Dön
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
