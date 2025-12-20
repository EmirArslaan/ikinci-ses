import Link from "next/link";
import { Listing } from "@/types";

interface ListingCardProps {
    listing: Listing;
    variant?: "carousel" | "grid";
}

// Format price to Turkish Lira
function formatPrice(price: number): string {
    return new Intl.NumberFormat("tr-TR").format(price) + " TL";
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Bugün";
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    return `${Math.floor(days / 30)} ay önce`;
}

// Get condition text in Turkish
function getConditionText(condition: string): string {
    const conditions: Record<string, string> = {
        "new": "Sıfır",
        "like-new": "Az Kullanılmış",
        "good": "İyi Durumda",
        "fair": "Kullanılmış",
    };
    return conditions[condition] || condition;
}

export default function ListingCard({ listing, variant = "carousel" }: ListingCardProps) {
    const defaultImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop";
    const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : defaultImage;

    // Check if urgent promotion is active
    const isUrgentActive = listing.isUrgent && listing.urgentUntil && new Date(listing.urgentUntil) > new Date();

    // Check if priority promotion is active
    const isPriorityActive = listing.isPriority && listing.priorityUntil && new Date(listing.priorityUntil) > new Date();

    if (variant === "grid") {
        return (
            <Link href={`/listings/${listing.id}`} className="group flex flex-col gap-3 rounded-2xl bg-white border border-gray-100 p-3 transition-all hover:shadow-lg hover:border-gray-200">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundImage: `url("${imageUrl}")` }}
                    />
                    {/* Badges Container */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isUrgentActive && (
                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-pulse">
                                ACİL
                            </div>
                        )}
                        {isPriorityActive && (
                            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                                ÜST SIRA
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col justify-between flex-1 px-1">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                        <p className="text-xs text-gray-500">{listing.category.name}</p>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                        <p className="text-base font-bold text-[#8B4513]">{formatPrice(listing.price)}</p>
                        <span className="material-symbols-outlined text-gray-400 hover:text-[#8B4513] cursor-pointer text-[20px]">favorite</span>
                    </div>
                </div>
            </Link>
        );
    }

    // Carousel variant
    return (
        <Link href={`/listings/${listing.id}`} className="group relative flex min-w-[280px] flex-col gap-3 rounded-2xl bg-white border border-gray-100 p-3 transition-transform hover:-translate-y-1 hover:shadow-xl hover:border-gray-200">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                />
                {/* Badges Container */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {isUrgentActive && (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg animate-pulse">
                            ACİL
                        </div>
                    )}
                    {isPriorityActive && (
                        <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                            ÜST SIRA
                        </div>
                    )}
                </div>
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-[#8B4513] hover:text-white transition-colors cursor-pointer text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                </div>
                {listing.location && (
                    <div className="absolute bottom-3 left-3 rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-gray-700">
                        {listing.location}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 px-1">
                <h3 className="text-lg font-bold leading-tight text-gray-900 group-hover:text-[#8B4513] transition-colors">{listing.title}</h3>
                <p className="text-xs text-gray-500">{listing.category.name} • {getConditionText(listing.condition)}</p>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold text-[#8B4513]">{formatPrice(listing.price)}</p>
                    <span className="text-xs text-gray-400">{formatRelativeTime(listing.createdAt)}</span>
                </div>
            </div>
        </Link>
    );
}
