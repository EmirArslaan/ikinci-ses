// Promotion package configurations

export const PROMOTION_PACKAGES = {
    featured: {
        id: 'featured',
        name: 'Ana Sayfa Vitrini',
        description: 'İlanınız ana sayfadaki "Öne Çıkanlar" alanında görünür',
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
        description: 'İlanınız kendi kategorisinde her zaman en üstte görünür',
        icon: 'vertical_align_top',
        color: 'blue',
        options: [
            { weeks: 1, price: 500, label: '1 Hafta' },
            { weeks: 2, price: 1200, label: '2 Hafta' },
            { weeks: 4, price: 1800, label: '4 Hafta' },
        ]
    },
    urgent: {
        id: 'urgent',
        name: 'Acil İlan',
        description: 'İlanınızda dikkat çekici "ACİL" etiketi görünür',
        icon: 'bolt',
        color: 'red',
        options: [
            { weeks: 1, price: 60, label: '1 Hafta' },
            { weeks: 2, price: 110, label: '2 Hafta' },
            { weeks: 4, price: 210, label: '4 Hafta' },
        ]
    }
};

export type PromotionType = 'featured' | 'priority' | 'urgent';

export interface PromotionSelection {
    type: PromotionType;
    weeks: number;
    price: number;
}

export function calculatePromotionEndDate(weeks: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + (weeks * 7));
    return date;
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR').format(price) + ' TL';
}
