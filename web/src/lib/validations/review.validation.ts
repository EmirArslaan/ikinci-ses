import { z } from 'zod';

// Create review schema
export const createReviewSchema = z.object({
    reviewedId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kullanıcı ID'),
    rating: z.number()
        .int('Puan tam sayı olmalıdır')
        .min(1, 'En düşük puan 1 olmalıdır')
        .max(5, 'En yüksek puan 5 olmalıdır'),
    comment: z.string()
        .min(10, 'Yorum en az 10 karakter olmalıdır')
        .max(1000, 'Yorum en fazla 1000 karakter olabilir')
        .optional(),
    listingId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz ilan ID')
        .optional(),
});

// Update review schema
export const updateReviewSchema = z.object({
    rating: z.number()
        .int('Puan tam sayı olmalıdır')
        .min(1, 'En düşük puan 1 olmalıdır')
        .max(5, 'En yüksek puan 5 olmalıdır')
        .optional(),
    comment: z.string()
        .min(10, 'Yorum en az 10 karakter olmalıdır')
        .max(1000, 'Yorum en fazla 1000 karakter olabilir')
        .optional(),
});

// Get reviews query schema
export const getReviewsQuerySchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kullanıcı ID').optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

// Types
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
