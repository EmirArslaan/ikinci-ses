"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState("");

    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setAvatar(user.avatar || "");
        }
    }, [user]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setAvatar(data.url);
            }
        } catch (error) {
            setMessage({ type: "error", text: "Avatar yüklenemedi" });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Yeni şifreler eşleşmiyor" });
            return;
        }

        if (newPassword && newPassword.length < 6) {
            setMessage({ type: "error", text: "Yeni şifre en az 6 karakter olmalı" });
            return;
        }

        if (newPassword && !currentPassword) {
            setMessage({ type: "error", text: "Şifre değiştirmek için mevcut şifrenizi girin" });
            return;
        }

        setLoading(true);
        try {
            const body: any = { name, email, avatar };
            if (currentPassword && newPassword) {
                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }

            const res = await fetch("/api/user/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Bir hata oluştu");
            }

            setMessage({ type: "success", text: "Ayarlar başarıyla güncellendi" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Show toast and redirect
            setShowToast(true);
            setTimeout(() => {
                router.push("/profile");
            }, 1500);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-[#8B4513]">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        Değişiklikler kaydedildi!
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Geri
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Hesap Ayarları</h1>
                    <div className="w-16"></div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-600"
                        : "bg-green-50 border border-green-200 text-green-600"
                        }`}>
                        <span className="material-symbols-outlined">
                            {message.type === "error" ? "error" : "check_circle"}
                        </span>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Profil Fotoğrafı</h2>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div
                                    className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white shadow-md"
                                    style={{
                                        backgroundImage: avatar
                                            ? `url('${avatar}')`
                                            : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B4513&color=fff&size=96')`
                                    }}
                                />
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                        <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">upload</span>
                                    Fotoğraf Yükle
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                                {avatar && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatar("")}
                                        className="ml-2 text-sm text-red-500 hover:underline"
                                    >
                                        Kaldır
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Info Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Profil Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={user?.phone || "Belirtilmemiş"}
                                        disabled
                                        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                                    />
                                    {user?.phoneVerified && (
                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                            <span className="material-symbols-outlined text-[16px]">verified</span>
                                            Doğrulanmış
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Telefon numarasını değiştirmek için destek ile iletişime geçin</p>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Şifre Değiştir</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined">save</span>
                        )}
                        Değişiklikleri Kaydet
                    </button>
                </form>
            </main>
        </div>
    );
}
