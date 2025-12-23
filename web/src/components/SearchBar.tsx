"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
    id: string;
    title: string;
    price: number;
    images: string[];
    category: { name: string };
}

export default function SearchBar() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside as any);
        return () => document.removeEventListener("mousedown", handleClickOutside as any);
    }, []);

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (!search.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/listings?search=${encodeURIComponent(search)}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.listings || []);
                    setShowResults(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [search]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/listings?search=${encodeURIComponent(search.trim())}`);
            setShowResults(false);
        }
    };

    return (
        <div className="relative flex-1 max-w-[480px]" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="flex w-full h-12">
                <div className="flex w-full flex-1 items-stretch rounded-full h-full border border-gray-200 bg-white focus-within:border-[#8B4513] transition-colors">
                    <div className="text-gray-400 flex items-center justify-center pl-4 pr-2">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex w-full min-w-0 flex-1 bg-transparent text-gray-900 focus:outline-0 border-none placeholder:text-gray-400 px-0 text-base font-normal leading-normal"
                        placeholder="Ne arıyorsun? (Gitar, Piyano...)"
                    />
                    <div className="pr-2 flex items-center">
                        {isLoading ? (
                            <div className="p-2">
                                <span className="material-symbols-outlined text-[20px] text-gray-400 animate-spin">progress_activity</span>
                            </div>
                        ) : (
                            <button type="submit" className="bg-[#8B4513]/10 hover:bg-[#8B4513]/20 text-[#8B4513] p-2 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Dropdown Results */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-2">
                        {results.map((result) => (
                            <Link
                                key={result.id}
                                href={`/listings/${result.id}`}
                                onClick={() => setShowResults(false)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                <div
                                    className="size-12 rounded-lg bg-gray-100 bg-cover bg-center shrink-0"
                                    style={{ backgroundImage: result.images[0] ? `url(${result.images[0]})` : undefined }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{result.title}</p>
                                    <p className="text-sm text-gray-500">{result.category.name}</p>
                                </div>
                                <p className="font-bold text-[#8B4513]">
                                    {new Intl.NumberFormat("tr-TR").format(result.price)} ₺
                                </p>
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <button
                            onClick={() => {
                                router.push(`/listings?search=${encodeURIComponent(search)}`);
                                setShowResults(false);
                            }}
                            className="w-full text-center text-sm font-medium text-[#8B4513] hover:text-[#A0522D]"
                        >
                            Tüm sonuçları gör →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
