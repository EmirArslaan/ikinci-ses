
import Link from "next/link";
import { Meetup } from "@prisma/client";

interface MeetupCardProps {
    meetup: Meetup & {
        user: {
            name: string;
            avatar: string | null;
        };
    };
}

export default function MeetupCard({ meetup }: MeetupCardProps) {
    const typeLabels: Record<string, string> = {
        CONCERT: "Konser",
        LESSON: "Ders",
        BAND: "Grup Üyesi",
        GEAR: "Ödünç Ekipman",
        STUDIO: "Stüdyo",
        COVERS: "Coverlar",
    };

    const typeColors: Record<string, string> = {
        CONCERT: "bg-pink-100 text-pink-700",
        LESSON: "bg-blue-100 text-blue-700",
        BAND: "bg-purple-100 text-purple-700",
        GEAR: "bg-orange-100 text-orange-700",
        STUDIO: "bg-green-100 text-green-700",
        COVERS: "bg-red-100 text-red-700",
    };

    return (
        <Link href={`/meetups/${meetup.id}`} className="group block h-full">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-pink-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    {meetup.images.length > 0 ? (
                        <img
                            src={meetup.images[0]}
                            alt={meetup.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-pink-200 bg-pink-50">
                            <span className="material-symbols-outlined text-5xl">groups</span>
                        </div>
                    )}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${typeColors[meetup.type] || "bg-gray-100 text-gray-700"}`}>
                        {typeLabels[meetup.type] || meetup.type}
                    </span>
                    {meetup.type === 'COVERS' && (
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                        </span>
                    )}
                    {meetup.price !== null && (
                        <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
                            {meetup.price === 0 ? "Ücretsiz" : `₺${meetup.price}`}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(meetup.date).toLocaleDateString('tr-TR')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {meetup.location}
                        </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {meetup.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {meetup.description}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-4 border-t border-pink-100">
                        <div
                            className="size-6 rounded-full bg-gray-200 bg-cover bg-center"
                            style={{
                                backgroundImage: meetup.user.avatar
                                    ? `url('${meetup.user.avatar}')`
                                    : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(meetup.user.name)}&background=pink&color=fff&size=24')`
                            }}
                        />
                        <span className="text-xs font-medium text-gray-600 truncate">
                            {meetup.user.name}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
