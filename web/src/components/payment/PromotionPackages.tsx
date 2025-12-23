'use client';

import { Star, TrendingUp, Zap, Check } from 'lucide-react';

export type PromotionType = 'FEATURED' | 'PRIORITY' | 'URGENT';

export interface PromotionPackage {
    type: PromotionType;
    weeks: number;
}

interface PromotionPackagesProps {
    selected: PromotionPackage[];
    onChange: (packages: PromotionPackage[]) => void;
}

const PACKAGES = [
    {
        type: 'FEATURED' as PromotionType,
        icon: Star,
        title: 'Öne Çıkan',
        description: 'İlanınız en üstte görünsün',
        price: 50,
        color: 'from-yellow-500 to-orange-500',
        features: [
            'Arama sonuçlarında en üstte',
            'Ana sayfada özel görünüm',
            'Altın kenarlık işareti',
            '3x daha fazla görüntüleme'
        ]
    },
    {
        type: 'PRIORITY' as PromotionType,
        icon: TrendingUp,
        title: 'Öncelikli',
        description: 'Daha fazla kişiye ulaşın',
        price: 30,
        color: 'from-blue-500 to-purple-500',
        features: [
            'Üst sıralarda listeleme',
            'Kategori sayfasında öncelik',
            'Mavi işaret',
            '2x daha fazla görüntüleme'
        ]
    },
    {
        type: 'URGENT' as PromotionType,
        icon: Zap,
        title: 'Acil',
        description: 'Hızlı satış için',
        price: 20,
        color: 'from-red-500 to-pink-500',
        features: [
            'Acil satılık etiketi',
            'Dikkat çekici işaret',
            'Mobil bildirimlerde öncelik',
            '1.5x daha fazla görüntüleme'
        ]
    }
];

export default function PromotionPackages({ selected, onChange }: PromotionPackagesProps) {
    const togglePackage = (type: PromotionType) => {
        const existingIndex = selected.findIndex(p => p.type === type);

        if (existingIndex >= 0) {
            // Remove package
            onChange(selected.filter(p => p.type !== type));
        } else {
            // Add package with default 1 week
            onChange([...selected, { type, weeks: 1 }]);
        }
    };

    const updateWeeks = (type: PromotionType, weeks: number) => {
        onChange(
            selected.map(p =>
                p.type === type ? { ...p, weeks: Math.max(1, Math.min(4, weeks)) } : p
            )
        );
    };

    const isSelected = (type: PromotionType) => {
        return selected.some(p => p.type === type);
    };

    const getWeeks = (type: PromotionType) => {
        return selected.find(p => p.type === type)?.weeks || 1;
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                    Promosyon Paketleri
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                    İlanınızı öne çıkarın ve daha fazla alıcıya ulaşın
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PACKAGES.map((pkg) => {
                    const Icon = pkg.icon;
                    const selected = isSelected(pkg.type);
                    const weeks = getWeeks(pkg.type);
                    const totalPrice = pkg.price * weeks;

                    return (
                        <div
                            key={pkg.type}
                            className={`
                relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${selected
                                    ? 'border-[var(--primary)] shadow-xl scale-[1.02]'
                                    : 'border-[var(--border)] hover:border-[var(--primary-light)] hover:shadow-lg'
                                }
              `}
                        >
                            {/* Gradient Header */}
                            <div className={`h-2 bg-gradient-to-r ${pkg.color}`} />

                            <div className="p-6 space-y-4">
                                {/* Package Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                      p-3 rounded-xl bg-gradient-to-br ${pkg.color} text-white
                      shadow-lg
                    `}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-[var(--text)]">
                                                {pkg.title}
                                            </h4>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {pkg.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-center py-4 bg-[var(--background-alt)] rounded-xl">
                                    <div className="text-3xl font-bold text-[var(--primary)]">
                                        {pkg.price} ₺
                                    </div>
                                    <div className="text-sm text-[var(--text-muted)] mt-1">
                                        / hafta
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-[var(--text-muted)]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Selection Button */}
                                <button
                                    type="button"
                                    onClick={() => togglePackage(pkg.type)}
                                    className={`
                    w-full py-3 rounded-xl font-semibold transition-all duration-300
                    ${selected
                                            ? 'bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary-dark)]'
                                            : 'bg-[var(--background-alt)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white'
                                        }
                  `}
                                >
                                    {selected ? 'Seçildi ✓' : 'Seç'}
                                </button>

                                {/* Week Selector */}
                                {selected && (
                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                                            Süre Seçin
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateWeeks(pkg.type, weeks - 1)}
                                                disabled={weeks <= 1}
                                                className="w-10 h-10 rounded-lg bg-[var(--background-alt)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center">
                                                <div className="text-2xl font-bold text-[var(--primary)]">
                                                    {weeks}
                                                </div>
                                                <div className="text-xs text-[var(--text-muted)]">
                                                    hafta
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateWeeks(pkg.type, weeks + 1)}
                                                disabled={weeks >= 4}
                                                className="w-10 h-10 rounded-lg bg-[var(--background-alt)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <span className="text-sm text-[var(--text-muted)]">Toplam: </span>
                                            <span className="text-lg font-bold text-[var(--primary)]">
                                                {totalPrice} ₺
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong className="font-semibold">💡 İpucu:</strong> Birden fazla promosyon paketi seçerek
                    ilanınızın görünürlüğünü maksimuma çıkarabilirsiniz.
                </p>
            </div>
        </div>
    );
}
