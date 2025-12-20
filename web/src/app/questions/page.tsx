import Link from "next/link";
import ListingsHeader from "@/components/ListingsHeader";
import ListingsFooter from "@/components/ListingsFooter";
import QuestionCard from "@/components/QuestionCard";
import { Category, Question, QuestionsResponse } from "@/types";

interface SearchParams {
    search?: string;
    categoryId?: string;
    page?: string;
    sort?: string;
}

// Fetch categories from API
async function getCategories(): Promise<Category[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Fetch questions with filters
async function getQuestions(params: SearchParams): Promise<QuestionsResponse> {
    try {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.set('search', params.search);
        if (params.categoryId) searchParams.set('categoryId', params.categoryId);
        if (params.page) searchParams.set('page', params.page);
        if (params.sort) searchParams.set('sort', params.sort);
        searchParams.set('limit', '12');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/questions?${searchParams.toString()}`, {
            cache: 'no-store'
        });
        if (!res.ok) return { questions: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } };
        return res.json();
    } catch {
        return { questions: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } };
    }
}

export default async function QuestionsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const [categories, questionsData] = await Promise.all([
        getCategories(),
        getQuestions(params),
    ]);

    const { questions, pagination } = questionsData;
    const currentPage = pagination.page;

    return (
        <div className="bg-[#ffffff] min-h-screen flex flex-col">
            <ListingsHeader />

            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 gap-8 flex flex-col lg:flex-row">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6">
                    <div className="hidden lg:flex flex-col gap-6">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Link className="text-[#6b7280] hover:text-gray-900" href="/">Anasayfa</Link>
                            <span className="text-[#6b7280]">/</span>
                            <span className="text-gray-900 font-medium">Soru & Cevap</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">filter_list</span>
                                Filtrele
                            </h3>

                            {/* Category Filter */}
                            <details className="group rounded-xl bg-[#f9fafb] border border-[#e5e7eb] overflow-hidden" open>
                                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors select-none">
                                    <span className="text-gray-900 font-medium">Kategori</span>
                                    <span className="material-symbols-outlined text-[#6b7280] group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <div className="px-4 pb-4 flex flex-col gap-1">
                                    <Link
                                        href="/questions"
                                        className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${!params.categoryId ? 'bg-purple-100 text-purple-700 font-medium' : 'text-[#6b7280] hover:bg-gray-100'}`}
                                    >
                                        Tüm Kategoriler
                                    </Link>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/questions?categoryId=${category.id}`}
                                            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${params.categoryId === category.id ? 'bg-purple-100 text-purple-700 font-medium' : 'text-[#6b7280] hover:bg-gray-100'}`}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            </details>

                            {/* Clear Filters */}
                            {params.categoryId && (
                                <Link
                                    href="/questions"
                                    className="flex items-center justify-center gap-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold py-2 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                    Filtreleri Temizle
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Questions List */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500 text-[32px]">help</span>
                                Soru & Cevap
                            </h1>
                            <p className="text-[#6b7280] text-sm mt-1">
                                Toplam {pagination.total} soru • Müzik aletleri hakkında merak ettiklerinizi sorun
                            </p>
                        </div>
                        <Link
                            href="/questions/create"
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Soru Sor
                        </Link>
                    </div>

                    {/* Grid */}
                    {questions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {questions.map((question) => (
                                <QuestionCard key={question.id} question={question} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="material-symbols-outlined text-[80px] text-gray-300 mb-4">help_center</span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz soru yok</h2>
                            <p className="text-gray-500 mb-6">İlk soruyu siz sorun!</p>
                            <Link
                                href="/questions/create"
                                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Soru Sor
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {currentPage > 1 && (
                                <Link
                                    href={`/questions?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
                                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                    Önceki
                                </Link>
                            )}
                            <span className="flex items-center px-4 py-2 text-gray-600">
                                {currentPage} / {pagination.totalPages}
                            </span>
                            {currentPage < pagination.totalPages && (
                                <Link
                                    href={`/questions?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
                                    className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                >
                                    Sonraki
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <ListingsFooter />
        </div>
    );
}
