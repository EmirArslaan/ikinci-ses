"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Question, Answer } from "@/types";

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    return `${Math.floor(days / 30)} ay önce`;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function QuestionDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const { token, isAuthenticated, user } = useAuth();

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Answer form
    const [answerContent, setAnswerContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Fetch question
    useEffect(() => {
        async function fetchQuestion() {
            try {
                const currentToken = token || localStorage.getItem("token");
                const res = await fetch(`/api/questions/${id}`);
                if (!res.ok) throw new Error("Soru bulunamadı");
                const data = await res.json();
                setQuestion(data);

                // Mark answers as read if this is the question owner
                if (currentToken && data.userId === user?.id) {
                    fetch(`/api/questions/${id}/mark-read`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${currentToken}`
                        }
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestion();
    }, [id, token, user?.id]);

    // Submit answer
    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!answerContent.trim()) return;

        setSubmitting(true);
        try {
            const currentToken = token || localStorage.getItem("token");

            const res = await fetch(`/api/questions/${id}/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`,
                },
                body: JSON.stringify({ content: answerContent }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Cevap gönderilemedi");
            }

            const newAnswer = await res.json();
            setQuestion(prev => prev ? {
                ...prev,
                answers: [...(prev.answers || []), newAnswer]
            } : null);
            setAnswerContent("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="material-symbols-outlined animate-spin text-4xl text-purple-500">progress_activity</span>
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">error</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Soru Bulunamadı</h1>
                <p className="text-gray-500 mb-6">{error || "Bu soru mevcut değil veya silinmiş olabilir."}</p>
                <Link href="/questions" className="text-purple-500 hover:underline">
                    Sorulara Dön
                </Link>
            </div>
        );
    }

    const isPriorityActive = question.isPriority && question.priorityUntil && new Date(question.priorityUntil) > new Date();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/questions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Sorulara Dön
                    </Link>
                    <span className="text-sm text-gray-500">{question.viewCount} görüntülenme</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Question */}
                <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Images */}
                    {question.images && question.images.length > 0 && (
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img
                                src={question.images[0]}
                                alt={question.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                                {question.category.icon} {question.category.name}
                            </span>
                            {isPriorityActive && (
                                <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                    Üst Sıra
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {question.title}
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {question.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                {question.user.avatar ? (
                                    <img src={question.user.avatar} alt={question.user.name} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <span className="text-purple-600 font-bold">
                                            {question.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{question.user.name}</p>
                                    <p className="text-sm text-gray-500">{formatRelativeTime(question.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Answers Section */}
                <section className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">chat</span>
                        Cevaplar ({question.answers?.length || 0})
                    </h2>

                    {/* Answer Form */}
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitAnswer} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                            <textarea
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                rows={4}
                                placeholder="Cevabınızı yazın..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !answerContent.trim()}
                                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">send</span>
                                    )}
                                    Cevapla
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-100 rounded-2xl p-6 mb-6 text-center">
                            <p className="text-gray-600 mb-3">Cevap vermek için giriş yapmalısınız</p>
                            <Link href="/auth/login" className="text-purple-500 font-medium hover:underline">
                                Giriş Yap
                            </Link>
                        </div>
                    )}

                    {/* Answers List */}
                    <div className="space-y-4">
                        {question.answers && question.answers.length > 0 ? (
                            question.answers.map((answer) => (
                                <div key={answer.id} className="bg-white rounded-2xl shadow-sm p-6">
                                    <div className="flex items-start gap-4">
                                        {answer.user.avatar ? (
                                            <img src={answer.user.avatar} alt={answer.user.name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-gray-600 font-bold">
                                                    {answer.user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-gray-900">{answer.user.name}</span>
                                                {answer.isAccepted && (
                                                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                        Kabul Edildi
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500">• {formatRelativeTime(answer.createdAt)}</span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {answer.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">forum</span>
                                <p className="text-gray-500">Henüz cevap yok. İlk cevabı siz verin!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
