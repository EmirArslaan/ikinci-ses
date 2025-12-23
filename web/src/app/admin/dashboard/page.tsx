'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/admin/StatCard';
import DashboardCharts from '@/components/admin/DashboardCharts';
import RecentActivity from '@/components/admin/RecentActivity';

interface Stats {
    users: { total: number; change: string };
    listings: { total: number; active: number; pending: number };
    payments: { total: number; count: number };
    pending: { total: number };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [listingsChart, setListingsChart] = useState<any>(null);
    const [revenueChart, setRevenueChart] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/auth/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all data in parallel
            const [statsRes, activityRes, listingsRes, revenueRes] = await Promise.all([
                fetch('/api/admin/stats', { headers }),
                fetch('/api/admin/activity', { headers }),
                fetch('/api/admin/charts/listings?period=7days', { headers }),
                fetch('/api/admin/charts/revenue', { headers })
            ]);

            if (!statsRes.ok || !activityRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const [statsData, activityData, listingsData, revenueData] = await Promise.all([
                statsRes.json(),
                activityRes.json(),
                listingsRes.json(),
                revenueRes.json()
            ]);

            setStats(statsData);
            setActivities(activityData.activities);
            setListingsChart(listingsData);
            setRevenueChart(revenueData);
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Platform istatistikleri ve yönetim paneli</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={stats?.users.total || 0}
                        change={stats?.users.change}
                        icon="group"
                        color="blue"
                    />
                    <StatCard
                        title="Aktif İlanlar"
                        value={stats?.listings.active || 0}
                        icon="inventory_2"
                        color="green"
                    />
                    <StatCard
                        title="Toplam Gelir"
                        value={`₺${stats?.payments.total.toLocaleString('tr-TR') || 0}`}
                        icon="payments"
                        color="purple"
                    />
                    <StatCard
                        title="Onay Bekleyen"
                        value={stats?.pending.total || 0}
                        icon="pending"
                        color="orange"
                    />
                </div>

                {/* Charts */}
                <div className="mb-8">
                    <DashboardCharts
                        listingsData={listingsChart}
                        revenueData={revenueChart}
                    />
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RecentActivity activities={activities} />
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="material-icons text-gray-600">info</span>
                            Özet Bilgiler
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Toplam İlan</span>
                                <span className="font-semibold">{stats?.listings.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Bekleyen İlan</span>
                                <span className="font-semibold text-orange-600">
                                    {stats?.listings.pending || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-600">Ödeme Sayısı</span>
                                <span className="font-semibold">{stats?.payments.count || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Toplam Kullanıcı</span>
                                <span className="font-semibold">{stats?.users.total || 0}</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-6 pt-6 border-t">
                            <h4 className="text-sm font-semibold mb-3">Hızlı Erişim</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => router.push('/admin/listings')}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">inventory_2</span>
                                    İlanları Yönet
                                </button>
                                <button
                                    onClick={() => router.push('/admin/questions')}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">help</span>
                                    Soruları Yönet
                                </button>
                                <button
                                    onClick={() => router.push('/admin/meetups')}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">event</span>
                                    Buluşmaları Yönet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
