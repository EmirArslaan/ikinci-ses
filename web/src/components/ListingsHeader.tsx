"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import NotificationBadge from "./NotificationBadge";
import SearchBar from "./SearchBar";

export default function ListingsHeader() {
    const { user, token, isAuthenticated, isLoading } = useAuth();
    const [qaNotificationCount, setQaNotificationCount] = useState(0);

    // Fetch Q&A notification count
    useEffect(() => {
        async function fetchQANotifications() {
            if (!isAuthenticated) return;

            const currentToken = token || localStorage.getItem("token");
            if (!currentToken) return;

            try {
                const res = await fetch("/api/questions/notifications", {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setQaNotificationCount(data.count || 0);
                }
            } catch (error) {
                console.error("Q&A notifications error:", error);
            }
        }

        fetchQANotifications();
        const interval = setInterval(fetchQANotifications, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, token]);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gray-200 bg-white/95 backdrop-blur-md px-10 py-3">
            <div className="flex items-center gap-8 w-full max-w-[1440px] mx-auto">
                {/* Logo */}
                <Link className="flex items-center gap-4 text-gray-900 hover:opacity-80 transition-opacity" href="/">
                    <div className="size-8 text-[#8B4513]">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em]">İkinci Ses</h2>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-[480px]">
                    <SearchBar />
                </div>

                {/* Navigation */}
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link className="text-gray-600 text-sm font-medium hover:text-[#8B4513] transition-colors" href="/">Anasayfa</Link>
                        <Link className="text-[#8B4513] text-sm font-medium transition-colors" href="/listings">İlanlar</Link>
                        <Link className="text-gray-600 text-sm font-medium hover:text-pink-500 transition-colors flex items-center gap-1" href="/meetups">
                            <span className="material-symbols-outlined text-[18px]">groups</span>
                            Müzisyen Buluşmaları
                        </Link>
                        <Link className="text-gray-600 text-sm font-medium hover:text-purple-500 transition-colors flex items-center gap-1 relative" href="/questions">
                            <span className="material-symbols-outlined text-[16px]">help</span>
                            Soru & Cevap
                            {qaNotificationCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse">
                                    {qaNotificationCount > 9 ? "9+" : qaNotificationCount}
                                </span>
                            )}
                        </Link>
                    </nav>
                    <div className="flex gap-3 items-center">
                        {isLoading ? (
                            <div className="h-10 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                        ) : isAuthenticated && user ? (
                            <>
                                <NotificationBadge />
                                {user.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center justify-center gap-2 rounded-full h-10 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                        <span className="hidden sm:inline">Admin</span>
                                    </Link>
                                )}
                                <Link
                                    href="/listings/create"
                                    className="flex items-center justify-center gap-2 rounded-full h-10 px-5 bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    <span>İlan Ver</span>
                                </Link>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 rounded-full h-10 px-3 bg-gray-100 border border-gray-200 hover:border-[#8B4513] transition-colors"
                                >
                                    <div
                                        className="size-7 rounded-full bg-cover bg-center"
                                        style={{
                                            backgroundImage: user.avatar
                                                ? `url('${user.avatar}')`
                                                : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B4513&color=fff&size=28')`
                                        }}
                                    />
                                    <span className="text-gray-700 text-sm font-medium hidden md:block">{user.name.split(" ")[0]}</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/listings/create"
                                    className="flex items-center justify-center gap-2 rounded-full h-10 px-5 bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    <span>İlan Ver</span>
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="hidden sm:flex items-center justify-center rounded-full h-10 px-5 bg-white border border-gray-200 hover:border-[#8B4513] text-gray-700 text-sm font-bold transition-colors"
                                >
                                    Giriş Yap
                                </Link>
                            </>
                        )}
                        <div className="sm:hidden flex items-center justify-center rounded-full size-10 bg-white border border-gray-200 text-gray-700">
                            <span className="material-symbols-outlined">menu</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
