import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Receipt, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentsHistoryPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/auth/login?redirect=/profile/payments');
    }

    const payload = getUserFromRequest({ cookies: () => cookieStore } as any);
    if (!payload) {
        redirect('/auth/login?redirect=/profile/payments');
    }

    // Fetch user's payment history
    const payments = await prisma.payment.findMany({
        where: { userId: payload.userId },
        include: {
            listing: {
                select: {
                    id: true,
                    title: true,
                    images: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            COMPLETED: 'bg-green-100 text-green-800 border-green-200',
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            FAILED: 'bg-red-100 text-red-800 border-red-200',
            REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        const icons = {
            COMPLETED: <CheckCircle size={16} />,
            PENDING: <Clock size={16} />,
            FAILED: <XCircle size={16} />,
            REFUNDED: <Receipt size={16} />
        };

        const labels = {
            COMPLETED: 'Tamamlandı',
            PENDING: 'Beklemede',
            FAILED: 'Başarısız',
            REFUNDED: 'İade Edildi'
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles] || styles.PENDING}`}>
                {icons[status as keyof typeof icons]}
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getPromotionName = (type: string | null) => {
        const names: Record<string, string> = {
            FEATURED: 'Öne Çıkan',
            PRIORITY: 'Öncelikli',
            URGENT: 'Acil'
        };
        return type ? names[type] || type : 'Bilinmiyor';
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                        Ödeme Geçmişi
                    </h1>
                    <p className="text-[var(--text-muted)]">
                        Tüm ödeme işlemlerinizi buradan görüntüleyebilirsiniz
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: 'Toplam Ödeme',
                            value: payments.length,
                            icon: Receipt,
                            color: 'blue'
                        },
                        {
                            label: 'Başarılı',
                            value: payments.filter(p => p.status === 'COMPLETED').length,
                            icon: CheckCircle,
                            color: 'green'
                        },
                        {
                            label: 'Beklemede',
                            value: payments.filter(p => p.status === 'PENDING').length,
                            icon: Clock,
                            color: 'yellow'
                        },
                        {
                            label: 'Toplam Tutar',
                            value: `${payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toFixed(2)} ₺`,
                            icon: Receipt,
                            color: 'purple'
                        }
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="p-6 rounded-2xl bg-white border-2 border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                                        <Icon size={20} className={`text-${stat.color}-600`} />
                                    </div>
                                    <span className="text-sm text-[var(--text-muted)]">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-bold text-[var(--text)]">
                                    {stat.value}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Payments List */}
                <div className="bg-white rounded-2xl border-2 border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[var(--text)]">
                            Ödemeler
                        </h2>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all">
                            <Filter size={18} />
                            Filtrele
                        </button>
                    </div>

                    {payments.length === 0 ? (
                        <div className="p-12 text-center">
                            <Receipt size={64} className="mx-auto text-[var(--text-muted)] mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                                Henüz Ödeme Yok
                            </h3>
                            <p className="text-[var(--text-muted)] mb-6">
                                Henüz herhangi bir ödeme işlemi gerçekleştirmediniz
                            </p>
                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-all"
                            >
                                İlanlarıma Git
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--background-alt)] border-b border-[var(--border)]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            Tarih
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            İlan
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            Paket
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            Tutar
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            Durum
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)]">
                                            İşlem No
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-[var(--background-alt)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-[var(--text)]">
                                                    {new Date(payment.createdAt).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    {new Date(payment.createdAt).toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment.listing ? (
                                                    <Link
                                                        href={`/listings/${payment.listing.id}`}
                                                        className="flex items-center gap-3 hover:text-[var(--primary)] transition-colors"
                                                    >
                                                        {payment.listing.images?.[0] && (
                                                            <img
                                                                src={payment.listing.images[0]}
                                                                alt={payment.listing.title}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div className="text-sm font-medium text-[var(--text)] max-w-xs truncate">
                                                            {payment.listing.title}
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-[var(--text-muted)]">
                                                        İlan bulunamadı
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-[var(--text)]">
                                                    {getPromotionName(payment.promotionType)}
                                                </div>
                                                {payment.promotionWeeks && (
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {payment.promotionWeeks} hafta
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-[var(--primary)]">
                                                    {payment.amount.toFixed(2)} ₺
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(payment.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-[var(--text-muted)] bg-[var(--background-alt)] px-2 py-1 rounded">
                                                    {payment.merchantOid}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
