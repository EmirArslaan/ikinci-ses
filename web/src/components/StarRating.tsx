"use client";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    editable?: boolean;
    onChange?: (rating: number) => void;
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = "md",
    editable = false,
    onChange
}: StarRatingProps) {
    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-2xl"
    };

    const handleClick = (index: number) => {
        if (editable && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxRating }, (_, index) => {
                const isFilled = index < Math.floor(rating);
                const isHalfFilled = index < rating && index >= Math.floor(rating);

                return (
                    <span
                        key={index}
                        onClick={() => handleClick(index)}
                        className={`material-symbols-outlined ${sizeClasses[size]} ${editable ? "cursor-pointer hover:scale-110 transition-transform" : ""
                            } ${isFilled
                                ? "text-yellow-500"
                                : isHalfFilled
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                            }`}
                    >
                        {isFilled ? "star" : isHalfFilled ? "star_half" : "star"}
                    </span>
                );
            })}
        </div>
    );
}
