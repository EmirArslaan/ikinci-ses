'use client';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
};

export default function StatCard({ title, value, change, icon, color }: StatCardProps) {
    const isPositive = change?.startsWith('+');

    return (
        <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
                <span className="material-icons text-4xl">{icon}</span>
                {change && (
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {change}
                    </span>
                )}
            </div>

            <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {title}
                </h3>
                <p className="text-3xl font-bold mt-2">
                    {value.toLocaleString('tr-TR')}
                </p>
            </div>
        </div>
    );
}
