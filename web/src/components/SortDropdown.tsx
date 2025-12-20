"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
    { value: "newest", label: "Yeniden Eskiye" },
    { value: "oldest", label: "Eskiden Yeniye" },
    { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
    { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
    { value: "priority", label: "Öne Çıkanlar Önce" },
];

export default function SortDropdown() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSort = searchParams.get("sort") || "newest";
    const currentLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || "Yeniden Eskiye";

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSort = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "newest") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        params.delete("page"); // Reset to first page on sort change
        router.push(`/listings?${params.toString()}`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#f9fafb] border border-[#e5e7eb] hover:border-[#8B4513] px-4 py-2 rounded-full text-gray-900 text-sm font-medium transition-colors"
            >
                {currentLabel}
                <span className={`material-symbols-outlined text-[18px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSort(option.value)}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${currentSort === option.value
                                    ? 'bg-[#8B4513]/5 text-[#8B4513] font-medium'
                                    : 'text-gray-700'
                                }`}
                        >
                            {option.label}
                            {currentSort === option.value && (
                                <span className="material-symbols-outlined text-[16px]">check</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
