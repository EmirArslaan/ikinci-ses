import { z } from 'zod';

// Listing condition enum
const listingConditionEnum = z.enum(['new', 'like-new', 'good', 'fair']);

// Create listing validation schema
export const createListingSchema = z.object({
    title: z.string()
        .min(5, 'Başlık en az 5 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olabilir'),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
    price: z.number()
        .positive('Fiyat pozitif bir sayı olmalıdır')
        .max(10000000, 'Fiyat çok yüksek'),
    condition: listingConditionEnum,
    categoryId: z.string()
        .min(1, 'Kategori seçimi zorunludur')
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kategori ID'),
    brandId: z.string()
        .min(1, 'Marka seçimi zorunludur')
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz marka ID'),
    images: z.array(z.string().url('Geçersiz resim URL'))
        .min(1, 'En az 1 resim yüklemelisiniz')
        .max(10, 'En fazla 10 resim yükleyebilirsiniz'),
    phone: z.string()
        .regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz'),
    location: z.string()
        .min(2, 'Konum en az 2 karakter olmalıdır')
        .max(100, 'Konum en fazla 100 karakter olabilir')
        .optional(),
    showPhone: z.boolean().optional(),
});

// Update listing validation schema
export const updateListingSchema = z.object({
    title: z.string()
        .min(5, 'Başlık en az 5 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olabilir')
        .optional(),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
        .optional(),
    price: z.number()
        .positive('Fiyat pozitif bir sayı olmalıdır')
        .max(10000000, 'Fiyat çok yüksek')
        .optional(),
    condition: listingConditionEnum.optional(),
    categoryId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kategori ID')
        .optional(),
    brandId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz marka ID')
        .optional(),
    images: z.array(z.string().url('Geçersiz resim URL'))
        .min(1, 'En az 1 resim yüklemelisiniz')
        .max(10, 'En fazla 10 resim yükleyebilirsiniz')
        .optional(),
    phone: z.string()
        .regex(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkiye telefon numarası giriniz')
        .optional(),
    location: z.string()
        .min(2, 'Konum en az 2 karakter olmalıdır')
        .max(100, 'Konum en fazla 100 karakter olabilir')
        .optional(),
    showPhone: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

// Listing query parameters validation
export const listingQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    brandId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    condition: listingConditionEnum.optional(),
    search: z.string().max(200).optional(),
    featured: z.coerce.boolean().optional(),
    priority: z.coerce.boolean().optional(),
    urgent: z.coerce.boolean().optional(),
    sortBy: z.enum(['createdAt', 'price', 'viewCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Promotion selection schema
export const promotionSchema = z.object({
    listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ge çersiz ilan ID'),
    promotions: z.array(
        z.object({
            type: z.enum(['FEATURED', 'PRIORITY', 'URGENT']),
            weeks: z.number().int().min(1).max(12),
        })
    ).min(1, 'En az bir promosyon seçmelisiniz'),
});

// Types
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingQuery = z.infer<typeof listingQuerySchema>;
export type PromotionInput = z.infer<typeof promotionSchema>;
