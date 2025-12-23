import { z } from 'zod';

// Create conversation schema
export const createConversationSchema = z.object({
    participantId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz kullanıcı ID'),
});

// Send message schema
export const sendMessageSchema = z.object({
    conversationId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz konuşma ID'),
    content: z.string()
        .min(1, 'Mesaj içeriği boş olamaz')
        .max(5000, 'Mesaj en fazla 5000 karakter olabilir'),
    imageUrl: z.string().url('Geçersiz resim URL').optional(),
});

// Mark as read schema
export const markAsReadSchema = z.object({
    messageIds: z.array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz mesaj ID')
    ).min(1, 'En az bir mesaj ID gereklidir'),
});

// Get messages query schema
export const getMessagesQuerySchema = z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Geçersiz konuşma ID'),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

// Types
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
