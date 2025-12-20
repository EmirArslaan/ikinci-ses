"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface ListingActionsProps {
    listingId: string;
    price: number;
    phone?: string;
    ownerId: string;
}

export default function ListingActions({ listingId, price, phone, ownerId }: ListingActionsProps) {
    const { favoriteIds, toggleFavorite, isAuthenticated, token } = useAuth();
    const isFavorited = favoriteIds.includes(listingId);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const formatPrice = (value: number) => {
        return "₺" + new Intl.NumberFormat("tr-TR").format(value);
    };

    const handleMessage = async () => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId: ownerId })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/messages?conversationId=${data.id}`);
            } else {
                const err = await res.json();
                alert(err.error || "Hata oluştu");
            }
        } catch (error) {
            console.error("Message error:", error);
            alert("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="mb-6">
                <p className="text-gray-500 text-sm font-medium mb-1">Satış Fiyatı</p>
                <h2 className="text-[#8B4513] text-4xl font-black tracking-tight">{formatPrice(price)}</h2>
            </div>
            <div className="flex flex-col gap-3">
                {phone && (
                    <a
                        href={`tel:${phone}`}
                        className="w-full h-12 bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                        <span className="material-symbols-outlined">call</span>
                        Satıcıyı Ara
                    </a>
                )}
                <button
                    onClick={handleMessage}
                    disabled={loading}
                    className="w-full h-12 bg-white border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <span className="material-symbols-outlined">chat_bubble</span>
                    {loading ? "Yükleniyor..." : "Satıcıyla İletişime Geç"}
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (!isAuthenticated) return;
                            toggleFavorite(listingId);
                        }}
                        className={`flex-1 h-12 border rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${isFavorited
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                    >
                        <span className={`material-symbols-outlined ${isFavorited ? "filled text-red-600" : "text-gray-500"}`}>favorite</span>
                        {isFavorited ? "Çıkar" : "Kaydet"}
                    </button>
                    <button className="size-12 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-full flex items-center justify-center transition-all" title="Paylaş">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
