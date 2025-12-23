import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Singleton instance
let io: SocketIOServer | null = null;

// Online users tracking
const onlineUsers = new Set<string>();

// Typing users tracking (conversationId -> Set of userIds)
const typingUsers = new Map<string, Set<string>>();

interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
}

export function getSocketServer(httpServer: HTTPServer): SocketIOServer {
    if (io) return io;

    io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const payload = verifyToken(token);
            if (!payload) {
                return next(new Error('Invalid token'));
            }
            socket.userId = payload.userId;
            socket.username = payload.name;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.userId}`);

        // Add to online users
        if (socket.userId) {
            onlineUsers.add(socket.userId);
            io?.emit('user_online', { userId: socket.userId });
        }

        // Join conversation room
        socket.on('join_conversation', async (conversationId: string) => {
            try {
                // Verify user is participant
                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                });

                if (!conversation || !socket.userId) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                if (!conversation.participants.includes(socket.userId)) {
                    return socket.emit('error', { message: 'Not a participant' });
                }

                socket.join(conversationId);
                console.log(`User ${socket.userId} joined conversation ${conversationId}`);
            } catch (err) {
                console.error('Join conversation error:', err);
                socket.emit('error', { message: 'Failed to join conversation' });
            }
        });

        // Leave conversation room
        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(conversationId);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Send message
        socket.on('send_message', async (data: {
            conversationId: string;
            content?: string;
            imageUrl?: string;
            tempId?: string;
        }) => {
            try {
                const { conversationId, content, imageUrl, tempId } = data;

                if (!socket.userId) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                // Verify participation
                const conversation = await prisma.conversation.findUnique({
                    where: { id: conversationId },
                });

                if (!conversation || !conversation.participants.includes(socket.userId)) {
                    return socket.emit('error', { message: 'Unauthorized' });
                }

                // Create message in database
                const message = await prisma.$transaction(async (tx) => {
                    const msg = await tx.message.create({
                        data: {
                            content: content || '',
                            imageUrl: imageUrl || null,
                            conversationId,
                            senderId: socket.userId!,
                            isRead: false,
                        },
                        include: {
                            sender: {
                                select: { id: true, name: true, avatar: true },
                            },
                        },
                    });

                    // Update conversation
                    const lastMessageText = imageUrl ? '📷 Görsel' : content || '';
                    await tx.conversation.update({
                        where: { id: conversationId },
                        data: {
                            lastMessage: lastMessageText,
                            lastMessageAt: new Date(),
                        },
                    });

                    return msg;
                });

                // Broadcast to conversation room
                io?.to(conversationId).emit('new_message', {
                    message,
                    tempId,
                });

                // Send confirmation to sender
                socket.emit('message_sent', {
                    tempId,
                    message,
                });

                // Create notification for recipient
                const recipientId = conversation.participants.find(p => p !== socket.userId);
                if (recipientId) {
                    const { createNotification } = await import('@/lib/notifications');
                    await createNotification({
                        userId: recipientId,
                        type: 'MESSAGE',
                        title: 'Yeni Mesaj',
                        message: `${socket.username || 'Bir kullanıcı'} size mesaj gönderdi`,
                        link: `/messages?conversationId=${conversationId}`,
                    });
                }
            } catch (err) {
                console.error('Send message error:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing start
        socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
            if (!socket.userId) return;

            // Add to typing users
            if (!typingUsers.has(conversationId)) {
                typingUsers.set(conversationId, new Set());
            }
            typingUsers.get(conversationId)?.add(socket.userId);

            // Broadcast to others in room
            socket.to(conversationId).emit('user_typing', {
                userId: socket.userId,
                username: socket.username,
            });
        });

        // Typing stop
        socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
            if (!socket.userId) return;

            // Remove from typing users
            typingUsers.get(conversationId)?.delete(socket.userId);

            // Broadcast to others in room
            socket.to(conversationId).emit('user_stopped_typing', {
                userId: socket.userId,
            });
        });

        // Mark messages as read
        socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
            try {
                if (!socket.userId) return;

                await prisma.message.updateMany({
                    where: {
                        conversationId,
                        senderId: { not: socket.userId },
                        isRead: false,
                    },
                    data: { isRead: true },
                });

                // Notify sender
                socket.to(conversationId).emit('messages_read', {
                    conversationId,
                    readBy: socket.userId,
                });
            } catch (err) {
                console.error('Mark read error:', err);
            }
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);

            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io?.emit('user_offline', { userId: socket.userId });

                // Clean up typing status
                typingUsers.forEach((users, conversationId) => {
                    if (users.has(socket.userId!)) {
                        users.delete(socket.userId!);
                        io?.to(conversationId).emit('user_stopped_typing', {
                            userId: socket.userId,
                        });
                    }
                });
            }
        });
    });

    return io;
}

export function getIO(): SocketIOServer | null {
    return io;
}
