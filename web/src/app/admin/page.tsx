"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Separate component to avoid hydration mismatch
function CurrentDate() {
    const [date, setDate] = useState('');

    useEffect(() => {
        setDate(new Date().toLocaleDateString('tr-TR'));
    }, []);

    return <span className="text-sm text-gray-500">{date}</span>;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [questionStats, setQuestionStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [meetupStats, setMeetupStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchStats();
            fetchQuestionStats();
            fetchMeetupStats();
        }
    }, [token]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/listings?limit=1000", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const listings: any[] = data.listings || [];

                const pending = listings.filter(l => l.approvalStatus === "PENDING").length;
                const approved = listings.filter(l => l.approvalStatus === "APPROVED").length;
                const rejected = listings.filter(l => l.approvalStatus === "REJECTED").length;

                setStats({
                    pending,
                    approved,
                    rejected,
                    total: listings.length
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestionStats = async () => {
        try {
            const res = await fetch("/api/admin/questions?status=PENDING", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setQuestionStats(data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMeetupStats = async () => {
        try {
            const res = await fetch("/api/admin/meetups", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Since the endpoint returns an array of pending meetups
                setMeetupStats(prev => ({ ...prev, pending: data.length }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-gray-500">İstatistikler yükleniyor...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
                <CurrentDate />
            </div>

            {/* Listings Stats */}
            <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8B4513]">sell</span>
                    İlanlar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Bekleyen İlanlar</span>
                            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-lg material-symbols-outlined text-[20px]">pending</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{stats.pending}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Onaylanan İlanlar</span>
                            <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{stats.approved}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Reddedilen İlanlar</span>
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg material-symbols-outlined text-[20px]">cancel</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{stats.rejected}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Toplam İlan</span>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined text-[20px]">inventory_2</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{stats.total}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Stats */}
            <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">help</span>
                    Sorular
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Bekleyen Sorular</span>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined text-[20px]">pending</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{questionStats.pending}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Onaylanan Sorular</span>
                            <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined text-[20px]">check_circle</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{questionStats.approved}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Reddedilen Sorular</span>
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg material-symbols-outlined text-[20px]">cancel</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{questionStats.rejected}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Toplam Soru</span>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined text-[20px]">quiz</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-bold text-gray-900">{questionStats.total}</h2>
                            <span className="text-sm text-gray-400 mb-1">Adet</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Alerts */}
            <div className="space-y-4">
                {stats.pending > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <span className="material-symbols-outlined">priority_high</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Onay bekleyen {stats.pending} ilan var</h3>
                                <p className="text-sm text-gray-600">İlanları inceleyip onaylayarak yayına alabilirsiniz.</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/listings?status=PENDING"
                            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-colors"
                        >
                            İlanları İncele
                        </Link>
                    </div>
                )}

                {questionStats.pending > 0 && (
                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined">help</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Onay bekleyen {questionStats.pending} soru var</h3>
                                <p className="text-sm text-gray-600">Soruları inceleyip onaylayarak yayına alabilirsiniz.</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/questions?status=PENDING"
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-colors"
                        >
                            Soruları İncele
                        </Link>
                    </div>
                )}

                {meetupStats.pending > 0 && (
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Onay bekleyen {meetupStats.pending} buluşma var</h3>
                                <p className="text-sm text-gray-600">Buluşma ilanlarını inceleyip onaylayarak yayına alabilirsiniz.</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/meetups"
                            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-full transition-colors"
                        >
                            Buluşmaları İncele
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
