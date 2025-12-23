import { Package, Search, FileQuestion, Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: 'package' | 'search' | 'question' | 'inbox';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const iconMap = {
    package: Package,
    search: Search,
    question: FileQuestion,
    inbox: Inbox,
};

/**
 * Empty State Component
 * Shows when there's no data to display
 */
export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
    const Icon = iconMap[icon];

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center max-w-md mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

/**
 * Pre-configured Empty States
 */
export const EmptyStates = {
    NoListings: () => (
        <EmptyState
            icon="package"
            title="Henüz ilan yok"
            description="Bu kategoride henüz ilan bulunmuyor. İlk ilanı siz oluşturun!"
        />
    ),

    NoSearchResults: () => (
        <EmptyState
            icon="search"
            title="Sonuç bulunamadı"
            description="Arama kriterlerinize uygun ilan bulunamadı. Farklı kelimeler veya filtreler deneyin."
        />
    ),

    NoFavorites: () => (
        <EmptyState
            icon="package"
            title="Henüz favori ilan yok"
            description="Beğendiğiniz ilanları favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz."
        />
    ),

    NoMessages: () => (
        <EmptyState
            icon="inbox"
            title="Henüz mesaj yok"
            description="İlan sahipleriyle iletişime geçtiğinizde mesajlarınız burada görünecek."
        />
    ),

    NoQuestions: () => (
        <EmptyState
            icon="question"
            title="Henüz soru yok"
            description="Topluluğa soru sorarak deneyimli müzisyenlerden yardım alabilirsiniz."
        />
    ),

    NoNotifications: () => (
        <EmptyState
            icon="inbox"
            title="Bildirim yok"
            description="Yeni bildirimleriniz burada görünecek."
        />
    ),
};

/**
 * Error State Component
 * Shows when there's an error loading data
 */
export function ErrorState({
    title = 'Bir hata oluştu',
    description = 'Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
    onRetry
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-red-100 p-6 mb-4">
                <svg
                    className="h-12 w-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 text-center max-w-md mb-6">{description}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Tekrar Dene
                </button>
            )}
        </div>
    );
}
