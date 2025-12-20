"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import DetailHeader from "@/components/DetailHeader";
import ListingActions from "@/components/ListingActions";
import { Listing, ListingsResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";

// Format price
function formatPrice(price: number): string {
    return new Intl.NumberFormat("tr-TR").format(price) + " TL";
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;
    return `${Math.floor(days / 7)} hafta önce`;
}

// Get condition text
function getConditionText(condition: string): string {
    const conditions: Record<string, string> = {
        "new": "Sıfır",
        "like-new": "Mükemmel (Kusursuz)",
        "good": "İyi Durumda",
        "fair": "Kullanılmış",
    };
    return conditions[condition] || condition;
}

export default function ListingDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { token, user, isLoading: isAuthLoading } = useAuth();

    const [listing, setListing] = useState<Listing | null>(null);
    const [similarListings, setSimilarListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const isOwner = token && listing && user && (user.id === listing.userId || user.role === "ADMIN");

    const handleDelete = async () => {
        if (!confirm("Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert("İlan başarıyla silindi.");
                router.push("/profile");
            } else {
                alert("İlan silinirken bir hata oluştu.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("İlan silinirken bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (isAuthLoading) return; // Wait for auth to initialize

        async function fetchData() {
            try {
                const headers: HeadersInit = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings/${id}`, {
                    cache: 'no-store',
                    headers
                });

                if (!res.ok) {
                    setError(true);
                    setIsLoading(false);
                    return;
                }

                const data: Listing = await res.json();
                setListing(data);

                // Fetch similar listings
                const similarRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?categoryId=${data.categoryId}&limit=4`, {
                    cache: 'no-store'
                });

                if (similarRes.ok) {
                    const similarData: ListingsResponse = await similarRes.json();
                    setSimilarListings(similarData.listings.filter(l => l.id !== data.id).slice(0, 4));
                }

            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [id, token, isAuthLoading]);

    if (error) {
        return notFound();
    }

    if (isLoading || isAuthLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <DetailHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B4513]"></div>
                </div>
            </div>
        );
    }

    if (!listing) return null;

    const defaultImage = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop";
    const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : defaultImage;

    return (
        <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
            <DetailHeader />

            {/* Approval Status Banner */}
            {listing.approvalStatus === "PENDING" && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-4 md:px-8 lg:px-10">
                    <div className="max-w-[1280px] mx-auto flex items-center gap-3 text-yellow-800">
                        <span className="material-symbols-outlined text-3xl">hourglass_top</span>
                        <div className="flex flex-col">
                            <span className="font-black text-lg md:text-xl tracking-tight">BU İLAN ONAY SÜRECİNDEDİR</span>
                            <span className="text-sm md:text-base opacity-90">İlanınız editörlerimiz tarafından incelenmektedir. Onaylandığında yayına alınacaktır.</span>
                        </div>
                    </div>
                </div>
            )}

            {listing.approvalStatus === "REJECTED" && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-4 md:px-8 lg:px-10">
                    <div className="max-w-[1280px] mx-auto flex items-center gap-3 text-red-800">
                        <span className="material-symbols-outlined text-3xl">cancel</span>
                        <div className="flex flex-col">
                            <span className="font-black text-lg md:text-xl tracking-tight">BU İLAN REDDEDİLMİŞTİR</span>
                            <span className="text-sm md:text-base opacity-90">Bu ilan yayında değildir. Lütfen düzenleyip tekrar gönderiniz.</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-6 md:px-8 lg:px-10">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 items-center pb-6 text-sm">
                    <Link className="text-gray-500 hover:text-[#8B4513] transition-colors font-medium" href="/">Ana Sayfa</Link>
                    <span className="text-gray-400 material-symbols-outlined text-xs">chevron_right</span>
                    <Link className="text-gray-500 hover:text-[#8B4513] transition-colors font-medium" href="/listings">İlanlar</Link>
                    <span className="text-gray-400 material-symbols-outlined text-xs">chevron_right</span>
                    <Link className="text-gray-500 hover:text-[#8B4513] transition-colors font-medium" href={`/listings?categoryId=${listing.categoryId}`}>{listing.category.name}</Link>
                    <span className="text-gray-400 material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 font-medium">{listing.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Gallery & Content */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Mobile Title */}
                        <div className="flex flex-col gap-2 lg:hidden">
                            <h1 className="text-2xl font-black leading-tight tracking-[-0.033em] text-gray-900">{listing.title}</h1>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-base">location_on</span>
                                <span>{listing.location || "Türkiye"}</span>
                                <span className="mx-1">•</span>
                                <span>{formatRelativeTime(listing.createdAt)}</span>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="flex flex-col gap-3">
                            {/* Main Image */}
                            <div
                                className="w-full aspect-[4/3] md:aspect-video rounded-2xl bg-center bg-cover relative group overflow-hidden shadow-lg"
                                style={{ backgroundImage: `url("${mainImage}")` }}
                            >
                                <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 backdrop-blur-sm transition-all shadow-md">
                                    <span className="material-symbols-outlined">fullscreen</span>
                                </button>
                            </div>

                            {/* Thumbnails */}
                            {listing.images && listing.images.length > 1 && (
                                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                                    {listing.images.slice(0, 4).map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`aspect - square rounded - xl bg - center bg - cover border - 2 cursor - pointer transition - all shadow - sm ${idx === 0
                                                ? 'border-[#8B4513]'
                                                : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                                                } `}
                                            style={{ backgroundImage: `url("${img}")` }}
                                        />
                                    ))}
                                    {listing.images.length > 4 && (
                                        <div className="aspect-square rounded-xl bg-gray-100 border-2 border-transparent text-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                                            <span className="material-symbols-outlined text-3xl">grid_view</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop Title Section */}
                        <div className="hidden lg:flex flex-col gap-3 border-b border-gray-200 pb-6">
                            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900">{listing.title}</h1>
                            <div className="flex items-center gap-4 text-gray-500">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                    <span className="text-base font-normal">{listing.location || "Türkiye"}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                    <span className="text-base font-normal">{formatRelativeTime(listing.createdAt)} yüklendi</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                    <span className="text-base font-normal">{listing.viewCount} görüntüleme</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-2xl font-bold text-gray-900">Açıklama</h3>
                            <div className="text-gray-600 leading-relaxed text-base space-y-4">
                                <p>{listing.description}</p>
                            </div>
                        </div>

                        {/* Specifications Table */}
                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mt-2 shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">Teknik Özellikler</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="grid grid-cols-2 p-4 hover:bg-gray-50 transition-colors">
                                    <span className="text-gray-500 font-medium">Marka</span>
                                    <span className="text-gray-900 font-semibold text-right">{listing.brand.name}</span>
                                </div>
                                <div className="grid grid-cols-2 p-4 hover:bg-gray-50 transition-colors">
                                    <span className="text-gray-500 font-medium">Kategori</span>
                                    <span className="text-gray-900 font-semibold text-right">{listing.category.name}</span>
                                </div>
                                <div className="grid grid-cols-2 p-4 hover:bg-gray-50 transition-colors">
                                    <span className="text-gray-500 font-medium">Durum</span>
                                    <span className="text-[#8B4513] font-bold text-right">{getConditionText(listing.condition)}</span>
                                </div>
                                {listing.location && (
                                    <div className="grid grid-cols-2 p-4 hover:bg-gray-50 transition-colors">
                                        <span className="text-gray-500 font-medium">Konum</span>
                                        <span className="text-gray-900 font-semibold text-right">{listing.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Safety Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                            <span className="material-symbols-outlined text-blue-600 text-3xl shrink-0">security</span>
                            <div>
                                <h4 className="text-blue-900 font-bold mb-1">Güvenli Alışveriş İpuçları</h4>
                                <p className="text-blue-700 text-sm leading-normal">Ürünü teslim alıp kontrol etmeden kapora veya tam ücret göndermeyiniz. İkinci Ses "Güvenli Ödeme" sistemini kullanarak paranızı koruma altına alabilirsiniz.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="sticky top-24 space-y-4">
                            {/* Owner Actions */}
                            {isOwner && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
                                    <h4 className="text-gray-900 font-bold border-b border-gray-100 pb-2">İlan Yönetimi</h4>
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/listings/${id}/edit`}
                                            className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Düzenle
                                        </Link>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            {isDeleting ? "Siliniyor..." : "Sil"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Card */}
                            <ListingActions
                                listingId={listing.id}
                                price={listing.price}
                                phone={listing.phone}
                                ownerId={listing.userId}
                            />

                            {/* Seller Profile Card */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div
                                            className="size-16 rounded-full bg-gray-200 bg-cover bg-center"
                                            style={{
                                                backgroundImage: listing.user.avatar
                                                    ? `url("${listing.user.avatar}")`
                                                    : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(listing.user.name)}&background=8B4513&color=fff&size=64")`
                                            }}
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-[#8B4513] text-white p-1 rounded-full border-2 border-white">
                                            <span className="material-symbols-outlined text-sm font-bold block">check</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 font-bold text-lg">{listing.user.name}</h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                            <span className="text-gray-900 font-bold">4.8</span>
                                            <span>(Değerlendirme)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-t border-gray-200 text-sm">
                                    <span className="text-gray-500">Son Görülme</span>
                                    <span className="text-green-600 font-medium">Çevrimiçi</span>
                                </div>
                                <Link
                                    href={`/listings?userId=${listing.userId}`}
                                    className="block w-full text-center py-3 mt-2 text-gray-700 font-bold text-sm bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Satıcının Diğer İlanları
                                </Link>
                            </div>

                            {/* Location Map Placeholder */}
                            {listing.location && (
                                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                                    <div className="h-40 bg-gray-200 relative">
                                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400 text-5xl">map</span>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <div className="size-12 bg-[#8B4513]/20 rounded-full flex items-center justify-center animate-pulse">
                                                <div className="size-4 bg-[#8B4513] rounded-full border-2 border-white"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-gray-500 mt-1">location_on</span>
                                        <div>
                                            <h5 className="text-gray-900 font-bold text-sm">{listing.location}</h5>
                                            <p className="text-gray-500 text-xs mt-1">Konum bilgisi yaklaşıktır.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Listings */}
                {similarListings.length > 0 && (
                    <div className="mt-16 mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            Benzer İlanlar
                            <Link className="text-sm font-medium text-[#8B4513] hover:underline ml-auto" href={`/listings?categoryId=${listing.categoryId}`}>
                                Tümünü Gör
                            </Link>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {similarListings.map((similar) => (
                                <Link key={similar.id} href={`/listings/${similar.id}`} className="group cursor-pointer">
                                    <div
                                        className="aspect-[4/3] rounded-2xl bg-gray-200 bg-cover bg-center mb-3 overflow-hidden relative shadow-sm"
                                        style={{
                                            backgroundImage: `url("${similar.images && similar.images.length > 0 ? similar.images[0] : defaultImage}")`
                                        }}
                                    >
                                        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <span className="material-symbols-outlined text-gray-600 text-sm">favorite</span>
                                        </div>
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-base truncate">{similar.title}</h3>
                                    <p className="text-gray-500 text-sm mb-2">{similar.location || "Türkiye"}</p>
                                    <p className="text-[#8B4513] font-bold">{formatPrice(similar.price)}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
