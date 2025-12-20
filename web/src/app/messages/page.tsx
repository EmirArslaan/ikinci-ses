"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
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
}

function MessagesContent() {
    const { token, user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [, setLoadingMessages] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Fetch Conversations
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

    // Fetch Messages
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
        } finally {
            setLoadingMessages(false);
        }
    }, [token]);

    // Initial Load & Polling for Conversation List
    useEffect(() => {
        if (!token) return;
        fetchConversations();

        const interval = setInterval(fetchConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, [token, fetchConversations]);

    // Effect for Active Conversation (Load & Poll Messages)
    useEffect(() => {
        if (!token || !activeConversationId) return;

        setLoadingMessages(true);
        fetchMessages(activeConversationId);

        const interval = setInterval(() => {
            fetchMessages(activeConversationId);
        }, 3000); // Poll messages every 3s

        return () => clearInterval(interval);
    }, [token, activeConversationId, fetchMessages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send Message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: activeConversationId,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages(activeConversationId); // Refresh immediately
                fetchConversations(); // Update side list preview
            }
        } catch (err) {
            console.error("Send error", err);
        }
    };

    // Handle Image Select and Upload
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversationId) return;

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setUploadingImage(true);

        try {
            // Convert to base64 using Promise
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsDataURL(file);
            });

            // Upload to Cloudinary
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ image: base64 })
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json().catch(() => ({}));
                console.error("Upload error response:", errorData);
                throw new Error("Upload failed");
            }

            const { url } = await uploadRes.json();

            // Send message with image
            const messageRes = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: activeConversationId,
                    imageUrl: url
                })
            });

            if (messageRes.ok) {
                fetchMessages(activeConversationId);
                fetchConversations();
            } else {
                const errorData = await messageRes.json().catch(() => ({}));
                console.error("Message error response:", errorData);
            }
        } catch (err) {
            console.error("Image upload error", err);
            alert("Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setUploadingImage(false);
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    if (isLoading) return null;

    return (
        <div className="bg-[#f3f4f6] h-screen flex flex-col">
            <DetailHeader />

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
                                    <div
                                        className="size-12 rounded-full bg-gray-200 bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: conv.otherUser.avatar ? `url('${conv.otherUser.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherUser.name)}&background=random')` }}
                                    />
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
                                        <div
                                            className="size-10 rounded-full bg-gray-200 bg-cover bg-center"
                                            style={{ backgroundImage: activeConversation.otherUser.avatar ? `url('${activeConversation.otherUser.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.otherUser.name)}&background=random')` }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{activeConversation.otherUser.name}</h3>
                                            <p className="text-xs text-green-600 font-medium">Çevrimiçi</p>
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
                                            <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl ${msg.imageUrl ? 'p-2' : 'px-5 py-3'} ${isMe ? 'bg-[#8B4513] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
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
                                                    {/* Görüldü göstergesi - sadece kendi mesajlarımda */}
                                                    {isMe && (
                                                        <span className={`material-symbols-outlined text-[14px] ${msg.isRead ? 'text-blue-300' : 'text-white/50'}`}>
                                                            done_all
                                                        </span>
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
                                {/* Hidden file input */}
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
                                    disabled={uploadingImage}
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
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Bir mesaj yazın..."
                                    className="flex-1 bg-gray-100 rounded-full px-5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:bg-white border border-transparent focus:border-[#8B4513]/30 transition-all font-medium text-gray-900"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
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
