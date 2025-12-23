'use client';

import { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardChartsProps {
    listingsData?: { labels: string[]; data: number[] };
    revenueData?: { labels: string[]; data: number[] };
}

export default function DashboardCharts({ listingsData, revenueData }: DashboardChartsProps) {
    if (!listingsData || !revenueData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                    <div className="h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        );
    }

    const listingsChartData = {
        labels: listingsData.labels,
        datasets: [
            {
                label: 'Yeni İlanlar',
                data: listingsData.data,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const revenueChartData = {
        labels: revenueData.labels,
        datasets: [
            {
                label: 'Gelir (TL)',
                data: revenueData.data,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Listings Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-icons text-green-600">trending_up</span>
                    İlan Trendi (Son 7 Gün)
                </h3>
                <div className="h-64">
                    <Line data={listingsChartData} options={chartOptions} />
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-icons text-purple-600">payments</span>
                    Gelir Trendi (Son 30 Gün)
                </h3>
                <div className="h-64">
                    <Bar data={revenueChartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
