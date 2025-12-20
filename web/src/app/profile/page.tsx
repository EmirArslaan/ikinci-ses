"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Listing } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { logout: authLogout, favoriteIds } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [userListings, setUserListings] = useState<Listing[]>([]);
    const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/auth/login");
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchUserListings(token, JSON.parse(storedUser).id);
    }, [router]);

    // Fetch favorites when tab changes
    useEffect(() => {
        if (activeTab === "favorites" && favoriteIds.length > 0) {
            fetch(`/api/listings?ids=${favoriteIds.join(",")}`)
                .then(res => res.json())
                .then(data => setFavoriteListings(data.listings || []))
                .catch(err => console.error("Error fetching favorites:", err));
        } else if (activeTab === "favorites" && favoriteIds.length === 0) {
            setFavoriteListings([]);
        }
    }, [activeTab, favoriteIds]);

    const fetchUserListings = async (token: string, userId: string) => {
        try {
            // Fetch user's listings
            const listingsRes = await fetch(`/api/listings?userId=${userId}`);
            if (listingsRes.ok) {
                const data = await listingsRes.json();
                setUserListings(data.listings || []);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authLogout();
        router.push("/");
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

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 text-gray-900 hover:opacity-80 transition-opacity">
                            <div className="size-8 text-[#8B4513]">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold tracking-tight hidden sm:block">İkinci Ses</h2>
                        </Link>

                        {/* Search */}
                        <div className="hidden md:flex flex-1 items-center max-w-md w-full">
                            <label className="relative flex items-center w-full group">
                                <span className="absolute left-4 text-gray-400 material-symbols-outlined">search</span>
                                <input
                                    className="w-[300px] bg-gray-100 text-gray-900 placeholder:text-gray-400 text-sm rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 transition-all border border-gray-200"
                                    placeholder="Gitar, Pedal, Amfi ara..."
                                    type="text"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/listings/create"
                            className="hidden sm:flex items-center justify-center h-10 px-6 bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-bold rounded-full transition-colors"
                        >
                            <span>İlan Ver</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button className="text-gray-600 hover:text-[#8B4513] transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <div
                                className="size-10 rounded-full bg-cover bg-center border-2 border-gray-200 cursor-pointer hover:border-[#8B4513] transition-colors"
                                style={{
                                    backgroundImage: user.avatar
                                        ? `url('${user.avatar}')`
                                        : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B4513&color=fff&size=40')`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
                        {/* Profile Card */}
                        <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="relative group">
                                    <div
                                        className="size-32 rounded-full bg-cover bg-center border-4 border-[#8B4513]"
                                        style={{
                                            backgroundImage: user.avatar
                                                ? `url('${user.avatar}')`
                                                : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B4513&color=fff&size=128')`
                                        }}
                                    />
                                    <button className="absolute bottom-0 right-0 p-2 bg-[#8B4513] text-white rounded-full shadow-lg hover:scale-105 transition-transform" title="Fotoğrafı Değiştir">
                                        <span className="material-symbols-outlined text-[20px] leading-none">edit</span>
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                    <p className="text-gray-500 font-medium">Müzisyen</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex flex-1 flex-col gap-1 rounded-xl bg-gray-100 p-3 items-center justify-center">
                                    <p className="text-gray-900 text-xl font-bold">{userListings.length}</p>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">İlan</p>
                                </div>
                                <div className="flex flex-1 flex-col gap-1 rounded-xl bg-gray-100 p-3 items-center justify-center">
                                    <div className="flex items-center gap-1 text-[#8B4513]">
                                        <span className="text-gray-900 text-xl font-bold">4.8</span>
                                        <span className="material-symbols-outlined text-[18px] mb-0.5">star</span>
                                    </div>
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Puan</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/profile/settings"
                                    className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm font-bold transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">settings</span>
                                    <span>Hesap Ayarları</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full h-11 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-sm font-bold transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#8B4513]">perm_contact_calendar</span>
                                İletişim
                            </h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 uppercase">Email</span>
                                    <span className="text-gray-900 text-sm">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <>
                                        <div className="w-full h-px bg-gray-100"></div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-400 uppercase">Telefon</span>
                                            <span className="text-gray-900 text-sm">{user.phone}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                            <div className="flex items-end justify-between mb-4">
                                <h3 className="text-gray-900 font-bold">Değerlendirmeler</h3>
                                <span className="text-gray-500 text-sm">0 yorum</span>
                            </div>
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center gap-3 text-xs">
                                        <span className="text-gray-900 w-3 font-medium">{star}</span>
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#8B4513] rounded-full" style={{ width: "0%" }}></div>
                                        </div>
                                        <span className="text-gray-400 w-8 text-right">0%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Right Content */}
                    <section className="flex-1 flex flex-col gap-6 min-w-0">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab("listings")}
                                className={`relative px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "listings" ? "text-[#8B4513] font-bold" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                İlanlarım ({userListings.length})
                                {activeTab === "listings" && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B4513] rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("favorites")}
                                className={`relative px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === "favorites" ? "text-[#8B4513] font-bold" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Favorilerim
                                {activeTab === "favorites" && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8B4513] rounded-t-full"></span>
                                )}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {activeTab === "listings" ? "Yayındaki İlanlar" : "Favori İlanlar"}
                            </h2>
                        </div>

                        {/* Listings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {(activeTab === "listings" ? userListings : favoriteListings).map((listing) => (
                                <Link
                                    key={listing.id}
                                    href={`/listings/${listing.id}`}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#8B4513]/50 transition-all hover:shadow-lg"
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                            style={{
                                                backgroundImage: `url('${listing.images?.[0] || "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop"}')`
                                            }}
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {listing.approvalStatus === "PENDING" && (
                                                <span className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">Onay Bekliyor</span>
                                            )}
                                            {listing.approvalStatus === "REJECTED" && (
                                                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">Reddedildi</span>
                                            )}
                                            {listing.approvalStatus === "APPROVED" && (
                                                <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Yayında</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 flex-1">
                                        <h3 className="text-gray-900 font-bold leading-tight group-hover:text-[#8B4513] transition-colors">
                                            {listing.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2">{listing.description}</p>
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                            <span className="text-lg font-bold text-[#8B4513]">{formatPrice(listing.price)}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => e.preventDefault()}
                                                    className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => e.preventDefault()}
                                                    className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Add New Card */}
                            <Link
                                href="/listings/create"
                                className="group flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#8B4513] hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                <div className="size-16 rounded-full bg-gray-100 group-hover:bg-[#8B4513] flex items-center justify-center mb-4 transition-colors">
                                    <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-white">add</span>
                                </div>
                                <h3 className="text-gray-900 font-bold text-lg">Yeni İlan Ekle</h3>
                                <p className="text-gray-500 text-sm mt-1">Satmak istediğin bir şey mi var?</p>
                            </Link>
                        </div>

                        {((activeTab === "listings" && userListings.length === 0) || (activeTab === "favorites" && favoriteListings.length === 0)) && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {activeTab === "listings" ? "Henüz ilan yok" : "Henüz favori yok"}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === "listings" ? "İlk ilanınızı oluşturarak başlayın!" : "Beğendiğiniz ilanları favorilere ekleyin!"}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
