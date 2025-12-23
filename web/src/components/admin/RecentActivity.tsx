'use client';

interface Activity {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
    icon: string;
    color: string;
}

interface RecentActivityProps {
    activities?: Activity[];
}

function getRelativeTime(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (!activities) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
                <div className="space-y-4 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-icons text-gray-600">history</span>
                Son Aktiviteler
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henüz aktivite yok</p>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                        >
                            <div className={`p-2 rounded-full ${colorMap[activity.color] || 'bg-gray-100 text-gray-600'}`}>
                                <span className="material-icons text-xl">{activity.icon}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {activity.subtitle}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {getRelativeTime(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
