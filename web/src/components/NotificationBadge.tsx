"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotificationBadge() {
    const { isAuthenticated, token } = useAuth();
    const [count, setCount] = useState(0);
    const pathname = usePathname();

    // Poll for notifications
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                }
            } catch (err) {
                console.error("Error fetching notifications", err);
            }
        };

        // Initial fetch
        fetchCount();

        // Poll every 10 seconds
        const interval = setInterval(fetchCount, 10000);

        return () => clearInterval(interval);
    }, [isAuthenticated, token, pathname]); // Re-fetch on path change (e.g. leaving messages page)

    return (
        <Link
            href="/messages"
            className="relative flex items-center justify-center gap-2 rounded-full size-10 bg-gray-100 hover:bg-[#8B4513]/10 text-gray-600 hover:text-[#8B4513] transition-colors"
            title="Mesajlarım"
        >
            <span className="material-symbols-outlined">mail</span>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}
