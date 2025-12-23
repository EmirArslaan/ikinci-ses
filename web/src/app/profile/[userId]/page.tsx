"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Listing } from "@/types";

interface User {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    createdAt: string;
    listingsCount: number;
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        if (!userId) return;

        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch user data
            const userRes = await fetch(`/api/users/${userId}`);
            if (!userRes.ok) {
                if (userRes.status === 404) {
                    setError("Kullanıcı bulunamadı");
                } else {
                    setError("Kullanıcı bilgileri yüklenirken hata oluştu");
                }
                return;
            }
            const userData = await userRes.json();
            setUser(userData.user);

            // Fetch user's listings (only approved)
            const listingsRes = await fetch(`/api/listings?userId=${userId}`);
            if (listingsRes.ok) {
                const listingsData = await listingsRes.json();
                // Filter to only show approved listings
                const approvedListings = (listingsData.listings || []).filter(
                    (listing: Listing) => listing.approvalStatus === "APPROVED"
                );
                setListings(approvedListings);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR").format(price) + " TL";
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-[#8B4513] text-xl">Yükleniyor...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-6xl text-gray-300">
                    person_off
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                    {error || "Kullanıcı bulunamadı"}
                </h2>
                <Link
                    href="/listings"
                    className="px-6 py-3 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold rounded-full transition-colors"
                >
                    İlanlara Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="flex items-center gap-3 text-gray-900 hover:opacity-80 transition-opacity"
                        >
                            <div className="size-8 text-[#8B4513]">
                                <svg
                                    className="w-full h-full"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                    ></path>
                                    <path
                                        clipRule="evenodd"
                                        d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold tracking-tight hidden sm:block">
                                İkinci Ses
                            </h2>
                        </Link>
                    </div>

                    <Link
                        href="/listings"
                        className="flex items-center gap-2 text-gray-600 hover:text-[#8B4513] transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="hidden sm:inline">İlanlara Dön</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - User Info */}
                    <aside className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
                        {/* Profile Card */}
                        <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div
                                    className="size-32 rounded-full bg-cover bg-center border-4 border-[#8B4513]"
                                    style={{
                                        backgroundImage: user.avatar
                                            ? `url('${user.avatar}')`
                                            : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user.name
                                            )}&background=8B4513&color=fff&size=128')`,
                                    }}
                                />
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {user.name}
                                    </h1>
                                    <p className="text-gray-500 font-medium">Müzisyen</p>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="flex gap-3">
                                <div className="flex flex-1 flex-col gap-1 rounded-xl bg-gray-100 p-3 items-center justify-center">
                                    <p className="text-gray-900 text-xl font-bold">
                                        {listings.length}
                                    </p>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                                        Aktif İlan
                                    </p>
                                </div>
                                <div className="flex flex-1 flex-col gap-1 rounded-xl bg-gray-100 p-3 items-center justify-center">
                                    <p className="text-gray-900 text-sm font-bold">
                                        {formatDate(user.createdAt)}
                                    </p>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">
                                        Üyelik
                                    </p>
                                </div>
                            </div>

                            {/* Contact Button */}
                            <button
                                onClick={() => setShowContact(!showContact)}
                                className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-bold transition-all"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    contact_mail
                                </span>
                                <span>İletişim Bilgileri</span>
                            </button>

                            {/* Contact Info (Collapsible) */}
                            {showContact && (
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined text-[#8B4513]">
                                            person
                                        </span>
                                        <span className="text-gray-900 font-medium">
                                            {user.name}
                                        </span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-[#8B4513]">
                                                phone
                                            </span>
                                            <a
                                                href={`tel:${user.phone}`}
                                                className="text-gray-900 font-medium hover:text-[#8B4513] transition-colors"
                                            >
                                                {user.phone}
                                            </a>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            İletişime geçmeden önce ilan detaylarını
                                            inceleyin.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right Content - Listings */}
                    <section className="flex-1 flex flex-col gap-6 min-w-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Aktif İlanlar ({listings.length})
                            </h2>
                        </div>

                        {/* Listings Grid */}
                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {listings.map((listing) => (
                                    <Link
                                        key={listing.id}
                                        href={`/listings/${listing.id}`}
                                        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#8B4513]/50 transition-all hover:shadow-lg"
                                    >
                                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                                style={{
                                                    backgroundImage: `url('${listing.images?.[0] ||
                                                        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop"
                                                        }')`,
                                                }}
                                            />
                                            {listing.condition && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full">
                                                        {listing.condition === "new"
                                                            ? "Sıfır"
                                                            : listing.condition ===
                                                                "like-new"
                                                                ? "Az Kullanılmış"
                                                                : listing.condition === "good"
                                                                    ? "İyi"
                                                                    : "Orta"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col gap-2 flex-1">
                                            <h3 className="text-gray-900 font-bold leading-tight group-hover:text-[#8B4513] transition-colors line-clamp-2">
                                                {listing.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">
                                                {listing.description}
                                            </p>
                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                                <span className="text-lg font-bold text-[#8B4513]">
                                                    {formatPrice(listing.price)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {listing.location || "Türkiye"}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                                    inventory_2
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Henüz aktif ilan yok
                                </h3>
                                <p className="text-gray-500">
                                    Bu kullanıcının şu anda aktif ilanı bulunmuyor.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
