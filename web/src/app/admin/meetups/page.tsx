"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Meetup } from "@prisma/client";
import Link from "next/link";

interface MeetupWithUser extends Meetup {
    user: {
        name: string;
        email: string;
    };
}

export default function AdminMeetupsPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get("status") || "ALL";

    const [meetups, setMeetups] = useState<MeetupWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMeetups = async () => {
        setLoading(true);
        try {
            let url = "/api/admin/meetups?limit=100";
            if (statusFilter !== "ALL") {
                url += `&status=${statusFilter}`;
            }

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMeetups(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && user?.role === "ADMIN") {
            fetchMeetups();
        }
    }, [token, user, statusFilter]);

    const handleAction = async (id: string, action: "approve" | "reject" | "delete") => {
        if (!confirm(`Bu işlemi yapmak istediğinize emin misiniz? (${action})`)) return;

        try {
            let res;
            if (action === "delete") {
                res = await fetch(`/api/admin/meetups/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                res = await fetch(`/api/admin/meetups/${id}/approve`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
                });
            }

            if (res.ok) {
                fetchMeetups();
            } else {
                alert("İşlem başarısız oldu.");
            }
        } catch (err) {
            console.error("Action error:", err);
            alert("Bir hata oluştu.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">Bekliyor</span>;
            case "APPROVED":
                return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">Onaylı</span>;
            case "REJECTED":
                return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">Reddedildi</span>;
            default:
                return null;
        }
    };

    const getMeetupTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            CONCERT: "Konser",
            LESSON: "Ders",
            BAND: "Grup Üyesi",
            GEAR: "Ödünç Ekipman",
            STUDIO: "Stüdyo",
            COVERS: "Coverlar"
        };
        return labels[type] || type;
    };

    if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Etkinlik Yönetimi</h1>

                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button
                        onClick={() => router.push("/admin/meetups")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "ALL" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => router.push("/admin/meetups?status=PENDING")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "PENDING" ? "bg-yellow-50 text-yellow-700" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Bekleyenler
                    </button>
                    <button
                        onClick={() => router.push("/admin/meetups?status=APPROVED")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "APPROVED" ? "bg-green-50 text-green-700" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Onaylılar
                    </button>
                    <button
                        onClick={() => router.push("/admin/meetups?status=REJECTED")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "REJECTED" ? "bg-red-50 text-red-700" : "text-gray-500 hover:text-gray-900"}`}
                    >
                        Reddedilenler
                    </button>
                </div>
            </div>

            {meetups.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">Bu filtreye uygun etkinlik bulunamadı.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-500">Etkinlik Başlığı</th>
                                    <th className="px-6 py-4 font-medium text-gray-500">Tip</th>
                                    <th className="px-6 py-4 font-medium text-gray-500">Oluşturan</th>
                                    <th className="px-6 py-4 font-medium text-gray-500">Durum</th>
                                    <th className="px-6 py-4 font-medium text-gray-500">Tarih</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {meetups.map((meetup) => (
                                    <tr key={meetup.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="size-10 rounded-lg bg-gray-100 bg-cover bg-center shrink-0"
                                                    style={{ backgroundImage: meetup.images?.[0] ? `url(${meetup.images[0]})` : undefined }}
                                                />
                                                <Link href={`/meetups/${meetup.id}`} target="_blank" className="font-medium text-gray-900 hover:text-pink-600">
                                                    {meetup.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {getMeetupTypeLabel(meetup.type)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {meetup.user?.name || "Bilinmiyor"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(meetup.approvalStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(meetup.date).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {meetup.approvalStatus === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(meetup.id, "approve")}
                                                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-bold"
                                                            title="Onayla"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                            Onayla
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(meetup.id, "reject")}
                                                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold"
                                                            title="Reddet"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                            Reddet
                                                        </button>
                                                    </>
                                                )}
                                                {meetup.approvalStatus === "REJECTED" && (
                                                    <button
                                                        onClick={() => handleAction(meetup.id, "approve")}
                                                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-xs font-bold"
                                                        title="Yeniden Onayla"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                        Onayla
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAction(meetup.id, "delete")}
                                                    className="size-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                                                    title="Sil"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
