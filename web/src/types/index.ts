// Types for our data
export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
}

export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
}

export interface User {
    id: string;
    name: string;
    avatar: string | null;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    phone: string;
    location: string | null;
    categoryId: string;
    category: Category;
    brandId: string;
    brand: Brand;
    userId: string;
    user: User;
    isActive: boolean;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    isFeatured: boolean;
    featuredUntil: string | null;
    isPriority: boolean;
    priorityUntil: string | null;
    isUrgent: boolean;
    urgentUntil: string | null;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ListingsResponse {
    listings: Listing[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Question {
    id: string;
    title: string;
    description: string;
    images: string[];
    categoryId: string;
    category: Category;
    userId: string;
    user: User;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    isFeatured: boolean;
    featuredUntil: string | null;
    isPriority: boolean;
    priorityUntil: string | null;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    answers?: Answer[];
    _count?: { answers: number };
}

export interface Answer {
    id: string;
    content: string;
    questionId: string;
    userId: string;
    user: User;
    isAccepted: boolean;
    createdAt: string;
}

export interface QuestionsResponse {
    questions: Question[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
