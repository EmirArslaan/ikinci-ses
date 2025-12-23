"use client";

import StarRating from "./StarRating";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        comment?: string | null;
        createdAt: string;
        reviewer: {
            id: string;
            name: string;
            avatar?: string | null;
        };
    };
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }).format(date);
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                    className="w-12 h-12 rounded-full bg-gray-200 bg-cover bg-center flex-shrink-0"
                    style={{
                        backgroundImage: review.reviewer.avatar
                            ? `url("${review.reviewer.avatar}")`
                            : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer.name)}&background=8B4513&color=fff&size=48")`
                    }}
                />

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="font-bold text-gray-900">{review.reviewer.name}</h4>
                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                    </div>

                    {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed mt-2">
                            {review.comment}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
