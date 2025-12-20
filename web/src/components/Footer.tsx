import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 py-12 text-gray-900">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 lg:grid-cols-4 lg:gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-[#8B4513]">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                            <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <span className="text-xl font-bold tracking-tight text-gray-900">İkinci Ses</span>
                    </div>
                    <p className="text-sm text-gray-500">Müzisyenlerin buluşma noktası. Güvenli alışveriş ve takas platformu.</p>
                </div>

                <div>
                    <h4 className="mb-4 font-bold text-gray-900">Hızlı Erişim</h4>
                    <ul className="flex flex-col gap-2 text-sm text-gray-500">
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/">Ana Sayfa</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings">Tüm İlanlar</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings/create">İlan Ver</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/auth/login">Giriş Yap</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-4 font-bold text-gray-900">Kategoriler</h4>
                    <ul className="flex flex-col gap-2 text-sm text-gray-500">
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings?category=elektro-gitar">Elektro Gitar</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings?category=akustik-gitar">Akustik Gitar</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings?category=davul-perkisyon">Davul & Perkisyon</Link></li>
                        <li><Link className="hover:text-[#8B4513] transition-colors" href="/listings?category=piyano-klavye">Piyano & Klavye</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="mb-4 font-bold text-gray-900">Bültene Abone Ol</h4>
                    <p className="mb-4 text-xs text-gray-500">Yeni ilanlardan ve fırsatlardan haberdar olmak için e-posta adresinizi bırakın.</p>
                    <div className="flex">
                        <input
                            className="w-full rounded-l-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] focus:outline-none"
                            placeholder="E-posta adresiniz"
                            type="email"
                        />
                        <button className="rounded-r-lg bg-[#8B4513] px-4 py-2 text-sm font-bold text-white hover:bg-[#A0522D]">Gönder</button>
                    </div>
                </div>
            </div>

            <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
                © 2024 İkinci Ses. Tüm hakları saklıdır.
            </div>
        </footer>
    );
}
