import { Metadata } from 'next';

/**
 * SEO Utility Functions
 * Generates optimized metadata for pages
 */

const APP_NAME = 'İkinci Ses';
const APP_DESCRIPTION = 'Türkiye\'nin en güvenilir ikinci el müzik enstrümanları alım-satım platformu';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface GenerateMetadataParams {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    price?: number;
    keywords?: string[];
}

/**
 * Generate complete metadata for a page
 */
export function generateMetadata({
    title,
    description,
    image,
    url,
    type = 'website',
    price,
    keywords = [],
}: GenerateMetadataParams): Metadata {
    const fullTitle = `${title} | ${APP_NAME}`;
    const fullUrl = url ? `${APP_URL}${url}` : APP_URL;
    const imageUrl = image || `${APP_URL}/og-image.png`;

    return {
        title: fullTitle,
        description,
        keywords: [
            'ikinci el',
            'müzik enstrümanı',
            'gitar',
            'piyano',
            'davul',
            'saz',
            'keman',
            ...keywords,
        ],
        authors: [{ name: APP_NAME }],
        creator: APP_NAME,
        publisher: APP_NAME,

        // Open Graph
        openGraph: {
            type,
            locale: 'tr_TR',
            url: fullUrl,
            title: fullTitle,
            description,
            siteName: APP_NAME,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },

        // Twitter
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [imageUrl],
            creator: '@ikincises',
        },

        // Additional meta tags
        alternates: {
            canonical: fullUrl,
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

/**
 * Generate metadata for listing detail page
 */
export function generateListingMetadata(listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    condition: string;
    category: { name: string };
    brand: { name: string };
}) {
    const keywords = [
        listing.category.name,
        listing.brand.name,
        listing.condition,
        'ikinci el',
        'satılık',
    ];

    return generateMetadata({
        title: listing.title,
        description: `${listing.description.substring(0, 155)}...`,
        image: listing.images[0],
        url: `/listings/${listing.id}`,
        type: 'product',
        price: listing.price,
        keywords,
    });
}

/**
 * Generate metadata for user profile page
 */
export function generateUserMetadata(user: {
    id: string;
    name: string;
    avatar?: string;
    totalReviews: number;
    averageRating?: number;
}) {
    const rating = user.averageRating ? ` (${user.averageRating.toFixed(1)} ⭐)` : '';
    const description = `${user.name} - ${user.totalReviews} değerlendirme${rating}. İkinci Ses'te güvenilir alıcı/satıcı.`;

    return generateMetadata({
        title: user.name,
        description,
        image: user.avatar,
        url: `/profile/${user.id}`,
        type: 'article',
    });
}

/**
 * Generate JSON-LD structured data for a listing (Product schema)
 */
export function generateListingJsonLd(listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    condition: string;
    user: {
        name: string;
        averageRating?: number;
        totalReviews: number;
    };
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description,
        image: listing.images,
        offers: {
            '@type': 'Offer',
            price: listing.price,
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
            itemCondition: getConditionSchema(listing.condition),
            seller: {
                '@type': 'Person',
                name: listing.user.name,
            },
        },
        aggregateRating: listing.user.totalReviews > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: listing.user.averageRating || 0,
            reviewCount: listing.user.totalReviews,
        } : undefined,
    };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: APP_NAME,
        description: APP_DESCRIPTION,
        url: APP_URL,
        logo: `${APP_URL}/logo.png`,
        sameAs: [
            'https://twitter.com/ikincises',
            'https://instagram.com/ikincises',
            'https://facebook.com/ikincises',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'info@ikincises.com',
        },
    };
}

/**
 * Helper: Convert condition to schema.org itemCondition
 */
function getConditionSchema(condition: string): string {
    const conditionMap: Record<string, string> = {
        'new': 'https://schema.org/NewCondition',
        'like-new': 'https://schema.org/NewCondition',
        'good': 'https://schema.org/UsedCondition',
        'fair': 'https://schema.org/UsedCondition',
    };
    return conditionMap[condition] || 'https://schema.org/UsedCondition';
}

/**
 * Component to inject JSON-LD structured data
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
