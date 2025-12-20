"use client";

import Link from "next/link";
import { Question } from "@/types";

interface QuestionCardProps {
    question: Question;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Bugün";
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    return `${Math.floor(days / 30)} ay önce`;
}

export default function QuestionCard({ question }: QuestionCardProps) {
    const defaultImage = "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop";
    const imageUrl = question.images && question.images.length > 0 && question.images[0] ? question.images[0] : defaultImage;

    // Check if priority promotion is active
    const isPriorityActive = question.isPriority && question.priorityUntil && new Date(question.priorityUntil) > new Date();

    const answerCount = question._count?.answers || question.answers?.length || 0;

    return (
        <Link href={`/questions/${question.id}`}>
            <article className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        alt={question.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={imageUrl}
                    />
                    {/* Badges Container */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {/* ÜST SIRA Badge */}
                        {isPriorityActive && (
                            <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                                ÜST SIRA
                            </div>
                        )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            {question.category.icon} {question.category.name}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900 font-bold text-lg leading-snug line-clamp-2 pr-2 group-hover:text-purple-600 transition-colors">
                            {question.title}
                        </h3>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{question.description}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                            {question.user.avatar ? (
                                <img src={question.user.avatar} alt={question.user.name} className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-600 text-xs font-bold">
                                        {question.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <span className="text-gray-600 text-sm">{question.user.name}</span>
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                                {answerCount}
                            </span>
                            <span>{formatRelativeTime(question.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
