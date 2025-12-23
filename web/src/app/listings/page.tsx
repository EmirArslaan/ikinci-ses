import Link from "next/link";
import ListingsHeader from "@/components/ListingsHeader";
import ListingsFooter from "@/components/ListingsFooter";
import ListingGridCard from "@/components/ListingGridCard";
import SortDropdown from "@/components/SortDropdown";
import FilterSidebar from "@/components/FilterSidebar";
import { Category, Listing, ListingsResponse } from "@/types";

interface SearchParams {
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    userId?: string;
    page?: string;
    sort?: string;
}

// Fetch categories from API
async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Fetch brands from API
async function getBrands() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/brands`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Fetch listings with filters
async function getListings(params: SearchParams): Promise<ListingsResponse> {
    try {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set('search', params.search);
        if (params.categoryId) searchParams.set('categoryId', params.categoryId);
        if (params.brandId) searchParams.set('brandId', params.brandId);
        if (params.minPrice) searchParams.set('minPrice', params.minPrice);
        if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);
        if (params.condition) searchParams.set('condition', params.condition);
        if (params.userId) searchParams.set('userId', params.userId);
        if (params.page) searchParams.set('page', params.page);
        if (params.sort) searchParams.set('sort', params.sort);
        searchParams.set('limit', '12');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?${searchParams.toString()}`, {
            cache: 'no-store'
        });
        if (!res.ok) return { listings: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } };
        return res.json();
    } catch {
        return { listings: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } };
    }
}

export default async function ListingsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const [categories, brands, listingsData] = await Promise.all([
        getCategories(),
        getBrands(),
        getListings(params),
    ]);

    const { listings, pagination } = listingsData;
    const currentPage = pagination.page;

    return (
        <div className="bg-[#ffffff] min-h-screen flex flex-col">
            <ListingsHeader />

            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 gap-8 flex flex-col lg:flex-row">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-[280px] flex-shrink-0">
                    <div className="hidden lg:block">
                        <FilterSidebar categories={categories} brands={brands} />
                    </div>
                </aside>

                {/* Product Listing */}
                <div className="flex-1 flex flex-col">
                    {/* List Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {params.search ? `"${params.search}" için sonuçlar` : 'Tüm İlanlar'}
                            </h1>
                            <p className="text-[#6b7280] text-sm mt-1">Toplam {pagination.total} ilan listeleniyor</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#6b7280] text-sm hidden sm:block">Sırala:</span>
                            <SortDropdown />
                        </div>
                    </div>

                    {/* Grid */}
                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {listings.map((listing) => (
                                <ListingGridCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-[64px] text-[#6b7280] mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-[#6b7280] mb-6">Aradığınız kriterlere uygun ilan bulunamadı.</p>
                            <Link
                                href="/listings/create"
                                className="flex items-center gap-2 bg-[#8B4513] text-[#ffffff] px-6 py-3 rounded-full font-bold hover:bg-[#A0522D] transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                İlk İlanı Siz Verin
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center mt-12 gap-2">
                            <Link
                                href={`/listings?page=${Math.max(1, currentPage - 1)}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                                className={`size-10 flex items-center justify-center rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-gray-900 hover:bg-white/10 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </Link>

                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Link
                                        key={pageNum}
                                        href={`/listings?page=${pageNum}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                                        className={`size-10 flex items-center justify-center rounded-full font-bold transition-colors ${currentPage === pageNum
                                            ? 'bg-[#8B4513] text-[#ffffff]'
                                            : 'bg-[#f9fafb] border border-[#e5e7eb] text-gray-900 hover:bg-white/10'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                );
                            })}

                            {pagination.totalPages > 5 && (
                                <>
                                    <span className="text-[#6b7280] px-2">...</span>
                                    <Link
                                        href={`/listings?page=${pagination.totalPages}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                                        className="size-10 flex items-center justify-center rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-gray-900 hover:bg-white/10 transition-colors"
                                    >
                                        {pagination.totalPages}
                                    </Link>
                                </>
                            )}

                            <Link
                                href={`/listings?page=${Math.min(pagination.totalPages, currentPage + 1)}${params.categoryId ? `&categoryId=${params.categoryId}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                                className={`size-10 flex items-center justify-center rounded-full bg-[#f9fafb] border border-[#e5e7eb] text-gray-900 hover:bg-white/10 ${currentPage === pagination.totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <ListingsFooter />
        </div>
    );
}
