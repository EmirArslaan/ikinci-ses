
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MeetupCard from "@/components/MeetupCard";
import ListingsHeader from "@/components/ListingsHeader";
import ListingsFooter from "@/components/ListingsFooter";

interface SearchParams {
    type?: string;
}

async function getMeetups(type?: string) {
    const where: any = { isActive: true, approvalStatus: 'APPROVED' };
    if (type) where.type = type;

    return await prisma.meetup.findMany({
        where,
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true,
                },
            },
        },
        orderBy: { date: 'asc' },
    });
}

export default async function MeetupsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams;
    const meetups = await getMeetups(params.type);

    const categories = [
        { id: 'CONCERT', name: 'Konser', icon: 'music_note' },
        { id: 'LESSON', name: 'Ders', icon: 'school' },
        { id: 'BAND', name: 'Grup Üyesi', icon: 'groups' },
        { id: 'GEAR', name: 'Ödünç Ekipman', icon: 'speaker' },
        { id: 'STUDIO', name: 'Stüdyo', icon: 'mic' },
        { id: 'COVERS', name: 'Coverlar', icon: 'movie' },
    ];

    return (
        <div className="bg-pink-50/30 min-h-screen flex flex-col">
            <ListingsHeader />

            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 gap-8 flex flex-col lg:flex-row">
                {/* Sidebar */}
                <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-pink-500">category</span>
                            Kategoriler
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/meetups"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!params.type ? 'bg-pink-500 text-white font-medium shadow-md shadow-pink-200' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                                Tümü
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/meetups?type=${cat.id}`}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${params.type === cat.id ? 'bg-pink-500 text-white font-medium shadow-md shadow-pink-200' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl">
                            <h1 className="text-3xl font-bold mb-2">Müzisyen Buluşmaları</h1>
                            <p className="text-pink-100 text-lg mb-6">
                                Konser partneri, grup üyesi veya ders verecek birini mi arıyorsunuz? Doğru yerdesiniz.
                            </p>
                            <Link
                                href="/meetups/create"
                                className="inline-flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-full font-bold hover:bg-pink-50 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Etkinlik Oluştur
                            </Link>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800')] bg-cover bg-center mask-image-gradient" />
                    </div>

                    {/* Listings Grid */}
                    {meetups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {meetups.map((meetup) => (
                                <MeetupCard key={meetup.id} meetup={meetup} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-pink-100">
                            <div className="size-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl text-pink-300">event_busy</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz etkinlik yok</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Bu kategoride henüz bir buluşma oluşturulmamış. İlk etkinliği siz oluşturun!
                            </p>
                            <Link
                                href="/meetups/create"
                                className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
                            >
                                Etkinlik Oluştur
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <ListingsFooter />
        </div>
    );
}
