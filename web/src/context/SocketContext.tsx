"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
    id: string;
    content: string;
    imageUrl?: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
    isRead: boolean;
    isPending?: boolean;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: Set<string>;
    sendMessage: (data: {
        conversationId: string;
        content?: string;
        imageUrl?: string;
    }) => Promise<void>;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    markAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: new Set(),
    sendMessage: async () => { },
    joinConversation: () => { },
    leaveConversation: () => { },
    startTyping: () => { },
    stopTyping: () => { },
    markAsRead: () => { },
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        console.log('🔌 Creating socket connection with token:', token?.substring(0, 20) + '...');

        // Create socket connection to standalone server
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const socketInstance = io(socketUrl, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
        });

        console.log('📡 Socket instance created');

        // Connection events
        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Online status events
        socketInstance.on('user_online', ({ userId }: { userId: string }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        socketInstance.on('user_offline', ({ userId }: { userId: string }) => {
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isAuthenticated, token]);

    const sendMessage = useCallback(async (data: {
        conversationId: string;
        content?: string;
        imageUrl?: string;
    }) => {
        return new Promise<void>((resolve, reject) => {
            if (!socket || !isConnected) {
                reject(new Error('Not connected'));
                return;
            }

            const tempId = `temp-${Date.now()}`;

            socket.emit('send_message', {
                ...data,
                tempId,
            });

            // Wait for confirmation
            const timeout = setTimeout(() => {
                reject(new Error('Message timeout'));
            }, 10000);

            socket.once('message_sent', ({ tempId: receivedTempId }) => {
                if (receivedTempId === tempId) {
                    clearTimeout(timeout);
                    resolve();
                }
            });

            socket.once('error', (error: { message: string }) => {
                clearTimeout(timeout);
                reject(new Error(error.message));
            });
        });
    }, [socket, isConnected]);

    const joinConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('join_conversation', conversationId);
        }
    }, [socket, isConnected]);

    const leaveConversation = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('leave_conversation', conversationId);
        }
    }, [socket, isConnected]);

    const startTyping = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('typing_start', { conversationId });
        }
    }, [socket, isConnected]);

    const stopTyping = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('typing_stop', { conversationId });
        }
    }, [socket, isConnected]);

    const markAsRead = useCallback((conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('mark_read', { conversationId });
        }
    }, [socket, isConnected]);

    const value: SocketContextType = {
        socket,
        isConnected,
        onlineUsers,
        sendMessage,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        markAsRead,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
}
