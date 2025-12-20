"use client";

import Link from "next/link";
import { Listing } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface ListingGridCardProps {
    listing: Listing;
}

// Format price to Turkish Lira
function formatPrice(price: number): string {
    return "₺" + new Intl.NumberFormat("tr-TR").format(price);
}

export default function ListingGridCard({ listing }: ListingGridCardProps) {
    const defaultImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop";
    const imageUrl = listing.images && listing.images.length > 0 && listing.images[0] ? listing.images[0] : defaultImage;

    const { favoriteIds, toggleFavorite, isAuthenticated } = useAuth();
    const isFavorited = favoriteIds.includes(listing.id);

    // Check if urgent promotion is active
    const isUrgentActive = listing.isUrgent && listing.urgentUntil && new Date(listing.urgentUntil) > new Date();

    // Check if priority promotion is active
    const isPriorityActive = listing.isPriority && listing.priorityUntil && new Date(listing.priorityUntil) > new Date();

    return (
        <Link href={`/listings/${listing.id}`}>
            <article className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-[#8B4513]/50 transition-all duration-300 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={imageUrl}
                    />
                    {/* Badges Container */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {/* ACİL Badge */}
                        {isUrgentActive && (
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                                ACİL
                            </div>
                        )}
                        {/* ÜST SIRA Badge */}
                        {isPriorityActive && (
                            <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                                ÜST SIRA
                            </div>
                        )}
                    </div>
                    <div className="absolute top-3 right-3">
                        <button
                            className={`backdrop-blur-md p-2 rounded-full transition-colors ${isFavorited
                                ? "bg-[#8B4513] text-white"
                                : "bg-white/80 text-gray-600 hover:bg-[#8B4513] hover:text-white"
                                }`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!isAuthenticated) {
                                    // Could redirect to login or show toast
                                    return;
                                }
                                toggleFavorite(listing.id);
                            }}
                        >
                            <span className={`material-symbols-outlined text-[20px] block ${isFavorited ? "filled" : ""}`}>favorite</span>
                        </button>
                    </div>
                    {listing.isFeatured && (
                        <div className="absolute bottom-3 left-3">
                            <span className="bg-[#8B4513] text-white text-xs font-bold px-3 py-1.5 rounded-full">Öne Çıkan</span>
                        </div>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900 font-bold text-lg leading-snug line-clamp-2 pr-2">{listing.title}</h3>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{listing.description}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex flex-col">
                            <span className="text-[#8B4513] font-black text-xl">{formatPrice(listing.price)}</span>
                            {listing.location && (
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                                    {listing.location}
                                </span>
                            )}
                        </div>
                        <button className="bg-gray-100 text-gray-700 p-3 rounded-full hover:bg-[#8B4513] hover:text-white transition-colors group-hover:bg-[#8B4513] group-hover:text-white">
                            <span className="material-symbols-outlined block -rotate-45">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </article>
        </Link>
    );
}
