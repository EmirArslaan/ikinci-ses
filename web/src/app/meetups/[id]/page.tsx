
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ListingsHeader from "@/components/ListingsHeader";
import ListingsFooter from "@/components/ListingsFooter";

async function getMeetup(id: string) {
    try {
        const meetup = await prisma.meetup.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });

        // Hide if not approved
        if (meetup && meetup.approvalStatus !== 'APPROVED') {
            return null;
        }

        return meetup;
    } catch {
        return null;
    }
}

export default async function MeetupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const meetup = await getMeetup(id);

    if (!meetup) notFound();

    const typeLabels: Record<string, string> = {
        CONCERT: "Konser",
        LESSON: "Ders",
        BAND: "Grup Üyesi",
        GEAR: "Ödünç Ekipman",
        STUDIO: "Stüdyo",
        COVERS: "Coverlar",
    };

    return (
        <div className="bg-pink-50/30 min-h-screen flex flex-col">
            <ListingsHeader />

            <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/meetups" className="hover:text-pink-600">Buluşmalar</Link>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>{typeLabels[meetup.type]}</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{meetup.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Images & Details) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Image */}
                        <div className="aspect-video w-full bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative group">
                            {meetup.videoUrl ? (
                                <video src={meetup.videoUrl} controls className="w-full h-full bg-black" />
                            ) : meetup.images.length > 0 ? (
                                <img src={meetup.images[0]} alt={meetup.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-pink-200 bg-pink-50">
                                    <span className="material-symbols-outlined text-6xl">groups</span>
                                </div>
                            )}
                            {!meetup.videoUrl && (
                                <div className="absolute top-4 left-4 bg-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                    {typeLabels[meetup.type]}
                                </div>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{meetup.title}</h1>
                            <div className="prose prose-pink max-w-none text-gray-600 bg-white p-8 rounded-3xl border border-pink-100">
                                {meetup.description}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Info) */}
                    <div className="space-y-6">
                        {/* Key Info Card */}
                        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Fiyat</span>
                                <span className="text-2xl font-bold text-pink-600">
                                    {meetup.price ? `₺${meetup.price}` : "Ücretsiz"}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                                        <span className="material-symbols-outlined">event</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">Tarih</div>
                                        <div className="font-bold text-gray-900">
                                            {new Date(meetup.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(meetup.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">Konum</div>
                                        <div className="font-bold text-gray-900">{meetup.location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organizer Card */}
                        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Organizatör</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="size-14 rounded-full bg-gray-200 bg-cover bg-center"
                                    style={{
                                        backgroundImage: meetup.user.avatar
                                            ? `url('${meetup.user.avatar}')`
                                            : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(meetup.user.name)}&background=pink&color=fff&size=56')`
                                    }}
                                />
                                <div>
                                    <div className="font-bold text-lg text-gray-900">{meetup.user.name}</div>
                                    <div className="text-sm text-gray-500">Müzisyen</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {meetup.user.phone && (
                                    <a href={`tel:${meetup.user.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">call</span>
                                        Ara
                                    </a>
                                )}
                                <a href={`mailto:${meetup.user.email}`} className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                    Mesaj Gönder
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ListingsFooter />
        </div>
    );
}
