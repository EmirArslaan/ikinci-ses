"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MultiSelect from "./MultiSelect";
import PriceRangeSlider from "./PriceRangeSlider";

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

interface FilterSidebarProps {
    categories: Category[];
    brands: Brand[];
}

export default function FilterSidebar({ categories, brands }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCondition, setSelectedCondition] = useState<string>("");
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(0);

    // Initialize from URL params
    useEffect(() => {
        const categoryId = searchParams.get("categoryId");
        const brandId = searchParams.get("brandId");
        const condition = searchParams.get("condition");
        const min = searchParams.get("minPrice");
        const max = searchParams.get("maxPrice");

        if (categoryId) setSelectedCategories(categoryId.split(","));
        if (brandId) setSelectedBrands(brandId.split(","));
        if (condition) setSelectedCondition(condition);
        if (min) setMinPrice(Number(min));
        if (max) setMaxPrice(Number(max));
    }, []);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        const search = searchParams.get("search");

        if (search) params.set("search", search);
        if (selectedCategories.length > 0) params.set("categoryId", selectedCategories.join(","));
        if (selectedBrands.length > 0) params.set("brandId", selectedBrands.join(","));
        if (selectedCondition) params.set("condition", selectedCondition);

        // Only add price params if not in 0-0 state (no filter)
        if (minPrice > 0 || maxPrice > 0) {
            if (minPrice > 0) params.set("minPrice", minPrice.toString());
            if (maxPrice > 0) params.set("maxPrice", maxPrice.toString());
        }

        router.push(`/listings?${params.toString()}`, { scroll: false });
    }, [selectedCategories, selectedBrands, selectedCondition, minPrice, maxPrice]);

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setSelectedCondition("");
        setMinPrice(0);
        setMaxPrice(0);

        const search = searchParams.get("search");
        if (search) {
            router.push(`/listings?search=${search}`);
        } else {
            router.push("/listings");
        }
    };

    const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 ||
        selectedCondition || minPrice > 0 || maxPrice > 0;

    const conditions = [
        { id: "new", name: "Sıfır" },
        { id: "like-new", name: "Az Kullanılmış" },
        { id: "good", name: "İyi Durumda" },
        { id: "fair", name: "Orta" }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 text-sm">
                <Link className="text-[#6b7280] hover:text-gray-900" href="/">Anasayfa</Link>
                <span className="text-[#6b7280]">/</span>
                <span className="text-gray-900 font-medium">İlanlar</span>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8B4513]">filter_list</span>
                    Filtrele
                </h3>

                {/* Category Filter */}
                <details className="group rounded-xl bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden" open>
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors select-none">
                        <span className="text-gray-900 font-medium">Kategori</span>
                        <span className="material-symbols-outlined text-[#6b7280] group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1">
                        <MultiSelect
                            options={categories}
                            selected={selectedCategories}
                            onChange={setSelectedCategories}
                        />
                    </div>
                </details>

                {/* Brand Filter */}
                <details className="group rounded-xl bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors select-none">
                        <span className="text-gray-900 font-medium">Marka</span>
                        <span className="material-symbols-outlined text-[#6b7280] group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1">
                        <MultiSelect
                            options={brands}
                            selected={selectedBrands}
                            onChange={setSelectedBrands}
                        />
                    </div>
                </details>

                {/* Price Range Filter */}
                <details className="group rounded-xl bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden" open>
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors select-none">
                        <span className="text-gray-900 font-medium">Fiyat Aralığı</span>
                        <span className="material-symbols-outlined text-[#6b7280] group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1">
                        <PriceRangeSlider
                            defaultMin={minPrice}
                            defaultMax={maxPrice}
                            onChange={(min, max) => {
                                setMinPrice(min);
                                setMaxPrice(max);
                            }}
                        />
                    </div>
                </details>

                {/* Condition Filter */}
                <details className="group rounded-xl bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors select-none">
                        <span className="text-gray-900 font-medium">Durum</span>
                        <span className="material-symbols-outlined text-[#6b7280] group-open:rotate-180 transition-transform">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                        {conditions.map((cond) => (
                            <button
                                key={cond.id}
                                onClick={() => setSelectedCondition(selectedCondition === cond.id ? "" : cond.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${selectedCondition === cond.id
                                    ? "text-[#8B4513] bg-[#8B4513]/10"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {selectedCondition === cond.id ? "check_circle" : "circle"}
                                </span>
                                {cond.name}
                            </button>
                        ))}
                    </div>
                </details>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 text-sm font-bold py-3 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        Filtreleri Temizle
                    </button>
                )}
            </div>
        </div>
    );
}
