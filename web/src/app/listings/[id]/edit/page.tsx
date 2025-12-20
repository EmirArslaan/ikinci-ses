"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { Listing } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function EditListingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { token, user, isLoading: isAuthLoading } = useAuth();

    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading) return;

        if (!token || !user) {
            router.push("/auth/login");
            return;
        }

        async function fetchListing() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings/${id}`, {
                    cache: 'no-store',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) notFound();
                    router.push("/listings");
                    return;
                }

                const data: Listing = await res.json();

                // Verify ownership (client-side check for UX)
                // Verify ownership (client-side check for UX)
                if (user && data.userId !== user.id && user.role !== "ADMIN") {
                    router.push("/listings");
                    return;
                }

                setListing(data);
            } catch (err) {
                console.error(err);
                router.push("/listings");
            } finally {
                setIsLoading(false);
            }
        }

        fetchListing();
    }, [id, token, user, isAuthLoading, router]);

    if (isLoading || isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B4513]"></div>
            </div>
        );
    }

    if (!listing) return null;

    return (
        <div className="bg-[#ffffff] min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] bg-[#ffffff]/90 backdrop-blur-md px-10 py-3">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-4 text-gray-900">
                        <div className="size-8 text-[#8B4513]">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">İkinci Ses</h2>
                    </Link>
                    <div className="hidden md:flex items-center gap-9">
                        <Link className="text-gray-600 text-sm font-medium leading-normal hover:text-[#8B4513] transition-colors" href="/">Anasayfa</Link>
                        <Link className="text-gray-600 text-sm font-medium leading-normal hover:text-[#8B4513] transition-colors" href="/listings">İlanlar</Link>
                        <Link className="text-gray-600 text-sm font-medium leading-normal hover:text-[#8B4513] transition-colors" href="/profile">Hesabım</Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center py-8 px-4 md:px-10 lg:px-40">
                <div className="w-full max-w-[960px] flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">İlanı Düzenle</h1>
                            <p className="text-[#6b7280] text-base font-normal leading-normal">İlan bilgilerini güncelleyebilirsin. Önemli değişikliklerde ilan tekrar onaya düşer.</p>
                        </div>
                    </div>

                    <ListingForm mode="edit" ticketId={id} initialData={listing} />
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-[#e5e7eb] py-8 bg-[#ffffff]">
                <div className="flex justify-center text-[#6b7280] text-sm">
                    © 2024 İkinci Ses. Tüm hakları saklıdır.
                </div>
            </footer>
        </div>
    );
}
