"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                router.push("/");
            } else {
                setError(data.error || "Giriş yapılırken hata oluştu");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Giriş yapılırken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans bg-[#ffffff] text-gray-900 min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="w-full border-b border-[#e5e7eb] bg-[#ffffff] sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 text-gray-900">
                        <div className="size-8 text-[#8B4513]">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillOpacity="0.5" fillRule="evenodd"></path>
                                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">İkinci Ses</h2>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex gap-6">
                            <Link className="text-sm font-medium hover:text-[#8B4513] transition-colors" href="/">Ana Sayfa</Link>
                            <Link className="text-sm font-medium hover:text-[#8B4513] transition-colors" href="/listings">İlanlar</Link>
                        </nav>
                        <div className="flex gap-3">
                            <Link
                                href="/auth/register"
                                className="flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-transparent border border-[#e5e7eb] text-gray-900 text-sm font-bold hover:bg-[#e5e7eb] transition-colors"
                            >
                                Kayıt Ol
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
                {/* Abstract Background Glow */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8B4513]/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    {/* Left Side: Login Form */}
                    <div className="flex flex-col justify-center order-2 lg:order-1">
                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">Tekrar Hoşgeldiniz</h1>
                            <p className="text-gray-400 text-lg">Müzik dünyasındaki yolculuğunuza devam edin.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl max-w-[480px] mx-auto lg:mx-0 w-full">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 max-w-[480px] mx-auto lg:mx-0 w-full">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-200 ml-1" htmlFor="email">
                                    E-posta veya Kullanıcı Adı
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#8B4513] transition-colors">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900"
                                        placeholder="örnek@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-sm font-semibold text-gray-200" htmlFor="password">
                                        Şifre
                                    </label>
                                    <a className="text-sm font-medium text-[#8B4513] hover:underline" href="#">Şifremi Unuttum?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#8B4513] transition-colors">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all placeholder:text-gray-500 text-gray-900"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#8B4513] hover:bg-[#A0522D] text-[#ffffff] text-lg font-bold rounded-full shadow-lg shadow-[#8B4513]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>{loading ? "Giriş Yapılıyor..." : "GİRİŞ YAP"}</span>
                                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                            </button>

                            {/* Divider */}
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-[#e5e7eb]"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">veya</span>
                                <div className="flex-grow border-t border-[#e5e7eb]"></div>
                            </div>

                            {/* Social Login */}
                            <button
                                type="button"
                                className="w-full h-14 bg-transparent border border-[#e5e7eb] hover:bg-[#f9fafb] text-gray-900 text-base font-semibold rounded-full transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile devam et
                            </button>

                            <p className="text-center text-gray-400 mt-6 text-sm">
                                Henüz hesabınız yok mu?
                                <Link className="text-gray-900 font-bold hover:text-[#8B4513] transition-colors underline decoration-2 decoration-[#8B4513]/50 hover:decoration-[#8B4513] ml-1" href="/auth/register">
                                    Hemen Kayıt Olun
                                </Link>
                            </p>
                        </form>
                    </div>

                    {/* Right Side: Hero Image */}
                    <div className="hidden lg:block h-full min-h-[600px] rounded-3xl overflow-hidden relative group order-1 lg:order-2">
                        <img
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Müzik stüdyosu"
                            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1200&fit=crop"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/40 to-transparent opacity-90"></div>
                        <div className="absolute bottom-0 left-0 w-full p-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B4513]/20 border border-[#8B4513]/30 backdrop-blur-sm mb-4">
                                <span className="w-2 h-2 rounded-full bg-[#8B4513] animate-pulse"></span>
                                <span className="text-[#8B4513] text-xs font-bold uppercase tracking-wider">Topluluk</span>
                            </div>
                            <blockquote className="text-gray-900 text-2xl font-bold leading-relaxed mb-4">
                                "İkinci Ses sayesinde hayalimdeki gitara bütçemi aşmadan kavuştum. Müzisyenler için güvenli bir liman."
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-[#8B4513] overflow-hidden flex items-center justify-center text-lg">
                                    🎸
                                </div>
                                <div>
                                    <p className="text-gray-900 text-sm font-bold">Ahmet Yılmaz</p>
                                    <p className="text-gray-400 text-xs">Profesyonel Gitarist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
