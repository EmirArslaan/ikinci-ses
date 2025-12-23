import { z } from 'zod';

// Meetup type enum
const meetupTypeEnum = z.enum(['CONCERT', 'LESSON', 'BAND', 'GEAR', 'STUDIO', 'COVERS']);

// Create meetup schema
export const createMeetupSchema = z.object({
    title: z.string()
        .min(5, 'Başlık en az 5 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olabilir'),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(3000, 'Açıklama en fazla 3000 karakter olabilir'),
    date: z.string()
        .datetime('Geçerli bir tarih formatı giriniz')
        .or(z.date())
        .transform((val) => new Date(val))
        .refine((date) => date > new Date(), {
            message: 'Buluşma tarihi gelecekte olmalıdır',
        }),
    location: z.string()
        .min(3, 'Konum en az 3 karakter olmalıdır')
        .max(200, 'Konum en fazla 200 karakter olabilir'),
    type: meetupTypeEnum,
    images: z.array(z.string().url('Geçersiz resim URL'))
        .max(5, 'En fazla 5 resim yükleyebilirsiniz')
        .optional()
        .default([]),
    videoUrl: z.string()
        .url('Geçerli bir video URL giriniz')
        .optional(),
    price: z.number()
        .nonnegative('Fiyat negatif olamaz')
        .max(100000, 'Fiyat çok yüksek')
        .optional(),
});

// Update meetup schema
export const updateMeetupSchema = z.object({
    title: z.string()
        .min(5, 'Başlık en az 5 karakter olmalıdır')
        .max(100, 'Başlık en fazla 100 karakter olabilir')
        .optional(),
    description: z.string()
        .min(20, 'Açıklama en az 20 karakter olmalıdır')
        .max(3000, 'Açıklama en fazla 3000 karakter olabilir')
        .optional(),
    date: z.string()
        .datetime('Geçerli bir tarih formatı giriniz')
        .or(z.date())
        .transform((val) => new Date(val))
        .refine((date) => date > new Date(), {
            message: 'Buluşma tarihi gelecekte olmalıdır',
        })
        .optional(),
    location: z.string()
        .min(3, 'Konum en az 3 karakter olmalıdır')
        .max(200, 'Konum en fazla 200 karakter olabilir')
        .optional(),
    type: meetupTypeEnum.optional(),
    images: z.array(z.string().url('Geçersiz resim URL'))
        .max(5, 'En fazla 5 resim yükleyebilirsiniz')
        .optional(),
    videoUrl: z.string()
        .url('Geçerli bir video URL giriniz')
        .optional(),
    price: z.number()
        .nonnegative('Fiyat negatif olamaz')
        .max(100000, 'Fiyat çok yüksek')
        .optional(),
    isActive: z.boolean().optional(),
});

// Meetup query schema
export const meetupQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    type: meetupTypeEnum.optional(),
    search: z.string().max(200).optional(),
    upcoming: z.coerce.boolean().optional(),
    sortBy: z.enum(['date', 'createdAt']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Types
export type CreateMeetupInput = z.infer<typeof createMeetupSchema>;
export type UpdateMeetupInput = z.infer<typeof updateMeetupSchema>;
export type MeetupQuery = z.infer<typeof meetupQuerySchema>;
