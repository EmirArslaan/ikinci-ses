
import Link from "next/link";
import MeetupForm from "@/components/MeetupForm";

export default function CreateMeetupPage() {
    return (
        <div className="min-h-screen bg-pink-50/30">
            {/* Simple Header */}
            <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/meetups" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Geri Dön
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Yeni Buluşma Oluştur</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-pink-100 text-pink-600 mb-4">
                        <span className="material-symbols-outlined text-3xl">add_location_alt</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Etkinlik veya İlan Oluştur</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Konser, ders, grup üyesi arama veya stüdyo kiralama... Müzisyenlerle buluşmak için ilanını oluştur.
                    </p>
                </div>

                <MeetupForm />
            </main>
        </div>
    );
}
