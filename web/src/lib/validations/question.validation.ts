import { z } from 'zod';

// Create question schema
export const createQuestionSchema = z.object({
    title: z.string()
        .min(10, 'Başlık en az 10 karakter olmalıdır')
        .max(200, 'Başlık en fazla 200 karakter olabilir'),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
    categoryId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kategori ID'),
    images: z.array(z.string().url('Geçersiz resim URL'))
        .max(5, 'En fazla 5 resim yükleyebilirsiniz')
        .optional()
        .default([]),
});

// Update question schema
export const updateQuestionSchema = z.object({
    title: z.string()
        .min(10, 'Başlık en az 10 karakter olmalıdır')
        .max(200, 'Başlık en fazla 200 karakter olabilir')
        .optional(),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
        .optional(),
    categoryId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kategori ID')
        .optional(),
    images: z.array(z.string().url('Geçersiz resim URL'))
        .max(5, 'En fazla 5 resim yükleyebilirsiniz')
        .optional(),
});

// Create answer schema
export const createAnswerSchema = z.object({
    questionId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz soru ID'),
    content: z.string()
        .min(10, 'Cevap en az 10 karakter olmalıdır')
        .max(3000, 'Cevap en fazla 3000 karakter olabilir'),
});

// Update answer schema
export const updateAnswerSchema = z.object({
    content: z.string()
        .min(10, 'Cevap en az 10 karakter olmalıdır')
        .max(3000, 'Cevap en fazla 3000 karakter olabilir'),
});

// Accept answer schema
export const acceptAnswerSchema = z.object({
    answerId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz cevap ID'),
});

// Question query schema
export const questionQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().max(200).optional(),
    featured: z.coerce.boolean().optional(),
    sortBy: z.enum(['createdAt', 'viewCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Question promotion schema
export const questionPromotionSchema = z.object({
    questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz soru ID'),
    promotions: z.array(
        z.object({
            type: z.enum(['FEATURED', 'PRIORITY']),
            weeks: z.number().int().min(1).max(12),
        })
    ).min(1, 'En az bir promosyon seçmelisiniz'),
});

// Types
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
export type AcceptAnswerInput = z.infer<typeof acceptAnswerSchema>;
export type QuestionQuery = z.infer<typeof questionQuerySchema>;
export type QuestionPromotionInput = z.infer<typeof questionPromotionSchema>;
