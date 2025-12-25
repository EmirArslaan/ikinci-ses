"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    // Verification
    const [verificationCode, setVerificationCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // State
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async () => {
        if (!email) {
            setError("E-posta adresi gerekli");
            return;
        }

        setSendingCode(true);
        setError("");

        try {
            const res = await fetch("/api/auth/send-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setCodeSent(true);
                setCountdown(60);
            } else {
                setError(data.error || "Kod gönderilemedi");
            }
        } catch (err) {
            setError("Kod gönderilirken hata oluştu");
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }

        if (!codeSent || !verificationCode) {
            setError("E-posta adresinizi doğrulayın");
            return;
        }

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır");
            return;
        }

        if (!acceptTerms || !acceptPrivacy) {
            setError("Kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                name,
                email,
                phone: phone || undefined,
                password,
                verificationCode: verificationCode || undefined
            };

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                router.push("/");
            } else {
                if (data.details && Array.isArray(data.details)) {
                    const detailMessages = data.details.map((d: any) => d.message).join(", ");
                    setError(`Lütfen formu kontrol edin: ${detailMessages}`);
                } else {
                    setError(data.error || "Kayıt olurken hata oluştu");
                }
            }
        } catch (err) {
            console.error("Register error:", err);
            setError("Kayıt olurken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans bg-[#ffffff] text-gray-900 h-screen w-full flex overflow-hidden">
            {/* Left Side: Hero Image Section */}
            <div className="hidden lg:flex w-1/2 h-full relative flex-col justify-end p-16">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&h=1600&fit=crop')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-[#ffffff]/80 to-transparent z-10"></div>
                <div className="relative z-20 max-w-xl">
                    <Link href="/" className="flex items-center gap-4 text-gray-900 mb-8">
                        <div className="size-8 text-[#8B4513]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-gray-900 text-2xl font-bold leading-tight tracking-[-0.015em]">İkinci Ses</h2>
                    </Link>
                    <h1 className="text-5xl font-black leading-tight tracking-[-0.033em] text-gray-900 mb-4">
                        Müziğe Yeniden Hayat Ver
                    </h1>
                    <p className="text-gray-500 text-lg font-normal leading-relaxed">
                        İkinci el enstrümanların güvenilir adresi. Binlerce müzisyen arasına katıl.
                    </p>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto flex flex-col relative bg-[#ffffff]">
                <div className="lg:hidden p-6 flex items-center justify-between border-b border-[#e5e7eb]">
                    <Link href="/" className="flex items-center gap-3 text-gray-900">
                        <div className="size-6 text-[#8B4513]">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-gray-900 text-lg font-bold">İkinci Ses</h2>
                    </Link>
                    <Link className="text-sm font-bold text-gray-900 hover:text-[#8B4513] transition-colors" href="/auth/login">Giriş Yap</Link>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-12">
                    <div className="w-full max-w-[480px] space-y-6">
                        <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-3xl font-black tracking-[-0.033em] text-gray-900">Hesap Oluştur</h2>
                            <p className="text-base font-normal text-[#6b7280]">
                                Hızlıca aramıza katıl, müzik tutkunu paylaş.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900" htmlFor="username">Kullanıcı Adı *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="username"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 focus:border-[#8B4513] focus:outline-none"
                                        placeholder="Kullanıcı adınızı girin"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400">person</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900" htmlFor="email">E-posta *</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 focus:border-[#8B4513] focus:outline-none"
                                            placeholder="ornek@email.com"
                                            required
                                            disabled={codeSent}
                                        />
                                        <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400">mail</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendCode}
                                        disabled={sendingCode || countdown > 0 || !email}
                                        className="px-4 h-12 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {sendingCode ? (
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        ) : countdown > 0 ? (
                                            `${countdown}s`
                                        ) : codeSent ? (
                                            "Tekrar Gönder"
                                        ) : (
                                            "Kod Gönder"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Verification Code */}
                            {codeSent && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900" htmlFor="code">Doğrulama Kodu *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="code"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 focus:border-[#8B4513] focus:outline-none font-mono text-center text-lg tracking-widest"
                                            placeholder="______"
                                            maxLength={6}
                                            required
                                        />
                                        <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400">pin</span>
                                    </div>
                                    <p className="text-xs text-gray-500">E-postanıza gönderilen 6 haneli kodu girin</p>
                                </div>
                            )}

                            {/* Phone (Optional) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900" htmlFor="phone">Telefon Numarası <span className="text-gray-400">(Opsiyonel)</span></label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 focus:border-[#8B4513] focus:outline-none"
                                        placeholder="5XX XXX XX XX"
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400">phone</span>
                                </div>
                                <p className="text-xs text-gray-500">İlan oluştururken otomatik doldurulacaktır</p>
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900" htmlFor="password">Şifre *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 focus:border-[#8B4513] focus:outline-none"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="material-symbols-outlined absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-gray-600"
                                        >
                                            {showPassword ? "visibility" : "visibility_off"}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900" htmlFor="confirm_password">Şifre Tekrarı *</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirm_password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-12 rounded-xl border border-gray-300 bg-gray-50 px-4 focus:border-[#8B4513] focus:outline-none"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3 pt-2">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 size-5 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                                    />
                                    <span className="text-sm text-gray-600">
                                        <Link className="text-[#8B4513] hover:underline font-medium" href="#">Kullanım Koşullarını</Link> okudum ve kabul ediyorum.
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptPrivacy}
                                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                        className="mt-0.5 size-5 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                                    />
                                    <span className="text-sm text-gray-600">
                                        <Link className="text-[#8B4513] hover:underline font-medium" href="#">Gizlilik Politikasını</Link> okudum ve kabul ediyorum.
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !codeSent}
                                className="w-full h-12 bg-[#8B4513] text-white font-bold rounded-full hover:bg-[#A0522D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Kayıt Olunuyor...
                                    </>
                                ) : (
                                    "Kayıt Ol"
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm font-medium text-[#6b7280]">
                            Zaten hesabın var mı?
                            <Link className="font-bold text-[#8B4513] hover:text-gray-900 transition-colors ml-1" href="/auth/login">Giriş Yap</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
