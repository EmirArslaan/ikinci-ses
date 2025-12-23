"use client";

interface TrustBadgeProps {
    isVerified?: boolean;
    isTrustedSeller?: boolean;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export default function TrustBadge({
    isVerified = false,
    isTrustedSeller = false,
    size = "md",
    showLabel = true
}: TrustBadgeProps) {
    const iconSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-xl"
    };

    const badges = [];

    if (isVerified) {
        badges.push({
            icon: "verified",
            label: "Doğrulanmış",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            tooltip: "E-posta ve telefon doğrulandı"
        });
    }

    if (isTrustedSeller) {
        badges.push({
            icon: "workspace_premium",
            label: "Güvenilir Satıcı",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            tooltip: "4.5+ yıldız, 5+ değerlendirme, 3+ ilan"
        });
    }

    if (badges.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {badges.map((badge, index) => (
                <div
                    key={index}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.bgColor} group relative`}
                    title={badge.tooltip}
                >
                    <span className={`material-symbols-outlined ${iconSizes[size]} ${badge.color}`}>
                        {badge.icon}
                    </span>
                    {showLabel && (
                        <span className={`text-xs font-medium ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                            {badge.tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
