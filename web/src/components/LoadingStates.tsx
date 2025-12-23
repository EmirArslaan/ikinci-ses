/**
 * Loading Spinner Component
 * Displays a loading spinner with optional text
 */
export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} animate-spin rounded-full border-blue-600 border-t-transparent`}
                role="status"
                aria-label="Loading"
            />
            {text && <p className="text-sm text-gray-600">{text}</p>}
        </div>
    );
}

/**
 * Full Page Loading
 * Covers the entire screen with a loading spinner
 */
export function PageLoading({ text = 'Yükleniyor...' }: { text?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

/**
 * Inline Loading
 * Can be used inline with content
 */
export function InlineLoading({ text }: { text?: string }) {
    return (
        <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" text={text} />
        </div>
    );
}

/**
 * Button Loading State
 * Shows loading state inside a button
 */
export function ButtonLoading() {
    return (
        <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
}

/**
 * Card Loading Skeleton
 * Skeleton loader for card-like components
 */
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    );
}

/**
 * List Item Skeleton
 * Skeleton loader for list items
 */
export function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    );
}

/**
 * Grid Skeleton
 * Shows skeleton loaders in a grid
 */
export function GridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Table Skeleton
 * Skeleton loader for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}
