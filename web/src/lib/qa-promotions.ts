// Q&A Promotion packages configuration

export type QAPromotionType = 'featured' | 'priority';

export interface QAPromotionSelection {
    featured: number | null; // weeks
    priority: number | null; // weeks
}

export const QA_PROMOTION_PACKAGES = {
    featured: {
        id: 'featured',
        name: 'Ana Sayfa',
        description: 'Sorunuz ana sayfada öne çıkanlar bölümünde görünsün',
        icon: 'home',
        color: 'amber',
        options: [
            { weeks: 1, price: 2500, label: '1 Hafta' },
            { weeks: 2, price: 4800, label: '2 Hafta' },
            { weeks: 4, price: 7000, label: '4 Hafta' },
        ]
    },
    priority: {
        id: 'priority',
        name: 'Üst Sıra',
        description: 'Sorunuz kendi kategorisinde en üstte kalsın',
        icon: 'arrow_upward',
        color: 'blue',
        options: [
            { weeks: 1, price: 500, label: '1 Hafta' },
            { weeks: 2, price: 1200, label: '2 Hafta' },
            { weeks: 4, price: 1800, label: '4 Hafta' },
        ]
    },
};

export function calculateQAPromotionEndDate(weeks: number): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (weeks * 7));
    return endDate;
}

export function formatQAPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
}
