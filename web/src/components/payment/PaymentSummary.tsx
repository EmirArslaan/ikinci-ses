'use client';

import { ShoppingCart, Package } from 'lucide-react';
import { PromotionPackage } from './PromotionPackages';

interface PaymentSummaryProps {
    packages: PromotionPackage[];
    isLoading?: boolean;
    onProceed: () => void;
}

const PACKAGE_PRICES = {
    FEATURED: 50,
    PRIORITY: 30,
    URGENT: 20
};

const PACKAGE_NAMES = {
    FEATURED: 'Öne Çıkan',
    PRIORITY: 'Öncelikli',
    URGENT: 'Acil'
};

export default function PaymentSummary({ packages, isLoading, onProceed }: PaymentSummaryProps) {
    const calculateSubtotal = () => {
        return packages.reduce((total, pkg) => {
            const price = PACKAGE_PRICES[pkg.type];
            return total + (price * pkg.weeks);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const kdv = subtotal * 0.20; // 20% KDV
    const total = subtotal + kdv;

    if (packages.length === 0) {
        return (
            <div className="sticky top-4 p-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--background-alt)] text-center">
                <Package size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                    Paket Seçimi Yapılmadı
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                    Devam etmek için en az bir promosyon paketi seçin
                </p>
            </div>
        );
    }

    return (
        <div className="sticky top-4 space-y-4">
            {/* Summary Card */}
            <div className="p-6 rounded-2xl border-2 border-[var(--border)] bg-white shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-[var(--primary)]/10">
                        <ShoppingCart size={24} className="text-[var(--primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text)]">
                        Sipariş Özeti
                    </h3>
                </div>

                {/* Package List */}
                <div className="space-y-3 mb-6">
                    {packages.map((pkg) => {
                        const price = PACKAGE_PRICES[pkg.type];
                        const itemTotal = price * pkg.weeks;

                        return (
                            <div
                                key={pkg.type}
                                className="p-4 rounded-xl bg-[var(--background-alt)] border border-[var(--border-light)]"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-[var(--text)]">
                                            {PACKAGE_NAMES[pkg.type]}
                                        </div>
                                        <div className="text-sm text-[var(--text-muted)]">
                                            {price} ₺/hafta × {pkg.weeks} hafta
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-[var(--primary)]">
                                            {itemTotal} ₺
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-t border-[var(--border)]">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Ara Toplam</span>
                        <span className="font-medium text-[var(--text)]">{subtotal.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">KDV (%20)</span>
                        <span className="font-medium text-[var(--text)]">{kdv.toFixed(2)} ₺</span>
                    </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-[var(--border)]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold text-[var(--text)]">
                            Toplam Tutar
                        </span>
                        <span className="text-3xl font-bold text-[var(--primary)]">
                            {total.toFixed(2)} ₺
                        </span>
                    </div>

                    {/* Proceed Button */}
                    <button
                        onClick={onProceed}
                        disabled={isLoading}
                        className="
              w-full py-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]
              hover:from-[var(--primary-dark)] hover:to-[var(--primary)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
              shadow-lg hover:shadow-xl
              transform hover:scale-[1.02]
            "
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                İşleniyor...
                            </span>
                        ) : (
                            'Ödemeye Geç'
                        )}
                    </button>
                </div>
            </div>

            {/* Security Badge */}
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-green-800">
                            Güvenli Ödeme
                        </div>
                        <div className="text-xs text-green-700">
                            256-bit SSL sertifikası ile korunmaktadır
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Policy */}
            <div className="text-xs text-[var(--text-muted)] text-center">
                <p>
                    Ödeme işleminiz tamamlandıktan sonra promosyon paketleri otomatik olarak aktifleşecektir.
                </p>
            </div>
        </div>
    );
}
