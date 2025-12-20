import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Category, Listing, ListingsResponse } from "@/types";

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

// Fetch featured listings
async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?featured=true&limit=5`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data: ListingsResponse = await res.json();
    return data.listings;
  } catch {
    return [];
  }
}

// Fetch recent listings
async function getRecentListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?limit=8`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data: ListingsResponse = await res.json();
    return data.listings;
  } catch {
    return [];
  }
}

// Category icon mapping
const categoryIcons: Record<string, string> = {
  "aksesuar": "music_note",
  "amfi-efekt": "speaker",
  "dj-ekipmanlari": "headphones",
  "davul-perkisyon": "music_note",
  "klasik-gitar": "music_note",
  "akustik-gitar": "music_note",
  "elektro-gitar": "music_note",
  "bas-gitar": "music_note",
  "nefesli-calgilar": "auto_awesome",
  "piyano-klavye": "piano",
  "studyo-ekipmanlari": "graphic_eq",
  "yayli-calgilar": "music_note",
};

export default async function Home() {
  const [categories, featuredListings, recentListings] = await Promise.all([
    getCategories(),
    getFeaturedListings(),
    getRecentListings(),
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative mx-auto max-w-[1280px] p-4 lg:p-6">
          <div
            className="relative flex min-h-[500px] flex-col items-center justify-center gap-8 overflow-hidden rounded-2xl bg-cover bg-center p-6 text-center shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.85)), url("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1280&h=720&fit=crop")`
            }}
          >
            <div className="flex flex-col gap-4 max-w-3xl z-10">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Müziğin <span className="text-amber-200">İkinci Sesi</span> Olun
              </h1>
              <h2 className="text-base font-normal leading-relaxed text-amber-100 sm:text-lg">
                Hayalinizdeki enstrümanı uygun fiyata keşfedin veya kullanmadığınız ekipmanları müzisyenlerle buluşturun.
              </h2>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-[600px] z-10">
              <form action="/listings" method="GET" className="relative flex h-14 w-full items-center rounded-full bg-white border border-gray-200 shadow-lg focus-within:border-[#8B4513] focus-within:ring-1 focus-within:ring-[#8B4513] transition-all">
                <div className="flex h-full w-14 items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  name="search"
                  className="h-full flex-1 bg-transparent px-2 text-base font-normal text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 border-none"
                  placeholder="Marka, model veya kategori ara..."
                />
                <div className="mr-1.5">
                  <button type="submit" className="flex h-11 items-center justify-center rounded-full bg-[#8B4513] px-6 text-sm font-bold text-white hover:bg-[#A0522D] transition-colors">
                    Ara
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Categories Chips */}
        <section className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            <Link
              href="/listings"
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#8B4513] px-5 hover:bg-[#A0522D] transition-colors shadow-lg shadow-[#8B4513]/20"
            >
              <span className="material-symbols-outlined text-white text-[20px]">music_note</span>
              <span className="text-sm font-bold text-white">Tüm İlanlar</span>
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/listings?categoryId=${category.id}`}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white border border-gray-200 px-5 hover:border-[#8B4513] hover:text-[#8B4513] transition-colors group"
              >
                <span className="material-symbols-outlined text-gray-400 group-hover:text-[#8B4513] text-[20px]">
                  {categoryIcons[category.slug] || "category"}
                </span>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Showcase */}
        <section className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B4513]">local_fire_department</span>
              Öne Çıkan Vitrin
            </h2>
            <Link className="text-sm font-bold text-[#8B4513] hover:text-[#A0522D] transition-colors" href="/listings?featured=true">
              Tümünü Gör
            </Link>
          </div>

          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {featuredListings.length > 0 ? (
              featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant="carousel" />
              ))
            ) : (
              // Placeholder if no featured listings
              <div className="flex min-w-full items-center justify-center py-12 text-gray-500">
                <p>Henüz öne çıkan ilan bulunmuyor. İlan vererek başlayın!</p>
              </div>
            )}
          </div>
        </section>

        {/* New Listings Grid */}
        <section className="mx-auto max-w-[1280px] px-4 py-8 lg:px-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B4513]">new_releases</span>
              Yeni İlanlar
            </h2>
            <div className="flex gap-2">
              <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#8B4513] hover:bg-[#8B4513] hover:text-white hover:border-[#8B4513] transition-colors">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">list</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentListings.length > 0 ? (
              recentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant="grid" />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
                <p>Henüz ilan bulunmuyor. İlk ilanı siz verin!</p>
              </div>
            )}
          </div>

          {recentListings.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Link
                href="/listings"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-[#8B4513] hover:text-[#8B4513] transition-all"
              >
                Daha Fazla Göster
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
