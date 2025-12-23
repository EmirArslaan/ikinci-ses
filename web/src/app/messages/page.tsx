"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useRouter, useSearchParams } from "next/navigation";
import DetailHeader from "@/components/DetailHeader";

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface Conversation {
    id: string;
    otherUser: User;
    lastMessage: string | null;
    lastMessageAt: string;
    isRead: boolean;
}

interface Message {
    id: string;
    content: string;
    imageUrl?: string;
    sender: User;
    createdAt: string;
    isRead: boolean;
    isPending?: boolean;
}

function MessagesContent() {
    const { token, user, isAuthenticated, isLoading } = useAuth();
    const {
        socket,
        isConnected,
        onlineUsers,
        sendMessage: socketSendMessage,
        joinConversation,
        leaveConversation,
        startTyping: socketStartTyping,
        stopTyping: socketStopTyping,
        markAsRead
    } = useSocket();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [typers, setTypers] = useState<Set<string>>(new Set());
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Initial check and param handling
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Handle initial conversation ID from URL
    useEffect(() => {
        const urlConvId = searchParams.get("conversationId");
        if (urlConvId) {
            setActiveConversationId(urlConvId);
        }
    }, [searchParams]);

    // Fetch Conversations (initial load only)
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/conversations", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (err) {
            console.error("Error fetching conversations", err);
        } finally {
            setLoadingConversations(false);
        }
    }, [token]);

    // Fetch Messages (initial load only)
    const fetchMessages = useCallback(async (convId: string) => {
        try {
            const res = await fetch(`/api/conversations/${convId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Error fetching messages", err);
        }
    }, [token]);

    // Initial fetch conversations
    useEffect(() => {
        if (!token) return;
        fetchConversations();
    }, [token, fetchConversations]);

    // Handle active conversation (join room + fetch initial messages)
    useEffect(() => {
        if (!activeConversationId || !isConnected) return;

        // Join conversation room
        joinConversation(activeConversationId);

        // Fetch initial messages
        fetchMessages(activeConversationId);

        // Mark as read
        markAsRead(activeConversationId);

        return () => {
            // Leave conversation on unmount
            leaveConversation(activeConversationId);
        };
    }, [activeConversationId, isConnected, joinConversation, leaveConversation, fetchMessages, markAsRead]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !activeConversationId) return;

        // New message handler
        const handleNewMessage = (data: { message: Message; tempId?: string }) => {
            setMessages(prev => {
                // Remove temp message ifexists
                const filtered = data.tempId
                    ? prev.filter(m => m.id !== data.tempId)
                    : prev;

                // Check if message already exists
                if (filtered.some(m => m.id === data.message.id)) {
                    return filtered;
                }

                return [...filtered, data.message];
            });

            // Update conversation list
            fetchConversations();

            // Mark as read if conversation is active
            if (activeConversationId) {
                markAsRead(activeConversationId);
            }
        };

        // Typing indicator handlers
        const handleUserTyping = (data: { userId: string; username?: string }) => {
            setTypers(prev => new Set([...prev, data.userId]));
        };

        const handleUserStoppedTyping = (data: { userId: string }) => {
            setTypers(prev => {
                const updated = new Set(prev);
                updated.delete(data.userId);
                return updated;
            });
        };

        // Read receipts handler
        const handleMessagesRead = () => {
            setMessages(prev => prev.map(m =>
                m.sender.id === user?.id ? { ...m, isRead: true } : m
            ));
        };

        // Register listeners
        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, activeConversationId, user, fetchConversations, markAsRead]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle input change with typing indicator
    const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!activeConversationId) return;

        // Emit typing start
        if (!isTyping) {
            socketStartTyping(activeConversationId);
            setIsTyping(true);
        }

        // Reset timeout
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketStopTyping(activeConversationId);
            setIsTyping(false);
        }, 3000);
    };

    // Send Message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || !user) return;

        const content = newMessage;
        const tempId = `temp-${Date.now()}`;

        // Clear input immediately
        setNewMessage("");

        // Stop typing indicator
        if (isTyping) {
            socketStopTyping(activeConversationId);
            setIsTyping(false);
        }
        clearTimeout(typingTimeoutRef.current);

        // Optimistic update
        const tempMessage: Message = {
            id: tempId,
            content,
            sender: {
                id: user.id,
                name: user.name,
                avatar: user.avatar
            },
            createdAt: new Date().toISOString(),
            isRead: false,
            isPending: true
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            await socketSendMessage({
                conversationId: activeConversationId,
                content
            });
        } catch (err) {
            console.error("Send error", err);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
        }
    };

    // Handle Image Upload
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversationId || !user) return;

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setUploadingImage(true);

        try {
            // Convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });

            // Upload to Cloudinary
            const uploadRes = await fetch("api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ image: base64 })
            });

            if (!uploadRes.ok) {
                throw new Error("Upload failed");
            }

            const { url } = await uploadRes.json();

            // Send via socket
            await socketSendMessage({
                conversationId: activeConversationId,
                imageUrl: url
            });

        } catch (err) {
            console.error("Image upload error", err);
            alert("Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setUploadingImage(false);
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const otherUserId = activeConversation?.otherUser.id;
    const isOtherUserOnline = otherUserId ? onlineUsers.has(otherUserId) : false;
    const isOtherUserTyping = otherUserId ? typers.has(otherUserId) : false;

    if (isLoading) return null;

    return (
        <div className="bg-[#f3f4f6] h-screen flex flex-col">
            <DetailHeader />

            {/* Connection Status Badge */}
            <div className="max-w-[1440px] w-full mx-auto px-4 pt-2">
                <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`size-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected ? 'Bağlı' : 'Bağlantı kuruluyor...'}
                </div>
            </div>

            <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 lg:p-8 flex gap-6 overflow-hidden">
                {/* Sidebar (Conversation List) */}
                <div className={`flex flex-col bg-white w-full md:w-80 lg:w-96 rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-xl text-gray-900">Mesajlar</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (
                            <div className="p-4 text-center text-gray-400">Yükleniyor...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">chat_bubble_outline</span>
                                <p>Henüz mesajınız yok.</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${activeConversationId === conv.id ? 'bg-orange-50 border-orange-100' : ''}`}
                                >
                                    <div className="relative">
                                        <div
                                            className="size-12 rounded-full bg-gray-200 bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: conv.otherUser.avatar ? `url('${conv.otherUser.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}&background=random')` }}
                                        />
                                        {onlineUsers.has(conv.otherUser.id) && (
                                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-900 truncate">{conv.otherUser.name}</h4>
                                            <span className="text-xs text-gray-400 shrink-0">{new Date(conv.lastMessageAt).toLocaleDateString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.lastMessage || <span className="italic">Görsel gönderildi</span>}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversationId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white z-10">
                                <button
                                    onClick={() => setActiveConversationId(null)}
                                    className="md:hidden text-gray-500"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                {activeConversation && (
                                    <>
                                        <div className="relative">
                                            <div
                                                className="size-10 rounded-full bg-gray-200 bg-cover bg-center"
                                                style={{ backgroundImage: activeConversation.otherUser.avatar ? `url('${activeConversation.otherUser.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.otherUser.name)}&background=random')` }}
                                            />
                                            {isOtherUserOnline && (
                                                <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{activeConversation.otherUser.name}</h3>
                                            <p className="text-xs font-medium">
                                                {isOtherUserTyping ? (
                                                    <span className="text-blue-600 flex items-center gap-1">
                                                        Yazıyor
                                                        <span className="flex gap-0.5">
                                                            <span className="size-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                            <span className="size-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                            <span className="size-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                        </span>
                                                    </span>
                                                ) : isOtherUserOnline ? (
                                                    <span className="text-green-600">Çevrimiçi</span>
                                                ) : (
                                                    <span className="text-gray-400">Çevrimdışı</span>
                                                )}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
                                {messages.map((msg) => {
                                    const isMe = msg.sender.id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl ${msg.imageUrl ? 'p-2' : 'px-5 py-3'} ${isMe ? 'bg-[#8B4513] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'} ${msg.isPending ? 'opacity-70' : ''}`}>
                                                {msg.imageUrl && (
                                                    <img
                                                        src={msg.imageUrl}
                                                        alt="Gönderilen görsel"
                                                        className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.imageUrl, '_blank')}
                                                    />
                                                )}
                                                {msg.content && (
                                                    <p className={`leading-relaxed ${msg.imageUrl ? 'mt-2 px-2' : ''}`}>{msg.content}</p>
                                                )}
                                                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${msg.imageUrl ? 'px-2' : ''} ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                    <span>{new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMe && (
                                                        <span className={`material-symbols-outlined text-[14px] ${msg.isRead ? 'text-blue-300' : 'text-white/50'}`}>
                                                            done_all
                                                        </span>
                                                    )}
                                                    {msg.isPending && (
                                                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage || !isConnected}
                                    className="size-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50"
                                >
                                    {uploadingImage ? (
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">add_circle</span>
                                    )}
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleMessageInputChange}
                                    placeholder="Bir mesaj yazın..."
                                    disabled={!isConnected}
                                    className="flex-1 bg-gray-100 rounded-full px-5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:bg-white border border-transparent focus:border-[#8B4513]/30 transition-all font-medium text-gray-900 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="size-10 flex items-center justify-center bg-[#8B4513] text-white rounded-full hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">forum</span>
                            <p className="text-lg font-medium">Bir sohbet seçin veya yeni bir ilan sahibiyle iletişime geçin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
