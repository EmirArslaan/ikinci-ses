import { XCircle, RefreshCw, HelpCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentFailPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const merchantOid = params.merchant_oid as string;
    const reason = params.reason as string;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Error Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500 mb-6">
                        <XCircle size={64} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-red-900 mb-2">
                        Ödeme Başarısız
                    </h1>
                    <p className="text-lg text-red-700">
                        İşleminiz tamamlanamadı
                    </p>
                </div>

                {/* Error Details Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    {merchantOid && (
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                İşlem Detayları
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">İşlem No:</span>
                                    <span className="font-mono font-semibold text-gray-900">
                                        {merchantOid}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tarih:</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Date().toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Durum:</span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Başarısız
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
                        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <XCircle size={20} />
                            Ödeme Alınamadı
                        </h3>
                        {reason && (
                            <p className="text-sm text-red-800 mb-4">
                                <strong>Hata Nedeni:</strong> {reason}
                            </p>
                        )}
                        <p className="text-sm text-red-700">
                            Ödemeniz işleme alınamadı. Lütfen kart bilgilerinizi kontrol edip
                            tekrar deneyiniz veya alternatif bir ödeme yöntemi kullanınız.
                        </p>
                    </div>

                    {/* Common Issues */}
                    <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                        <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                            <HelpCircle size={20} />
                            Yaygın Sorunlar ve Çözümleri
                        </h3>
                        <ul className="text-sm text-orange-800 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></span>
                                <span>Kart limitiniz yetersiz olabilir - Bankanızla iletişime geçin</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></span>
                                <span>Kart bilgilerini kontrol edin (numara, tarih, CVV)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></span>
                                <span>İnternet alışverişi kartınızda kapalı olabilir</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0"></span>
                                <span>3D Secure doğrulaması başarısız olmuş olabilir</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        <RefreshCw size={20} />
                        Tekrar Dene
                    </button>

                    <Link
                        href="/profile"
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-[var(--text)] font-semibold border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300"
                    >
                        İlanlarıma Dön
                    </Link>
                </div>

                {/* Support Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Phone size={20} />
                        Yardıma mı İhtiyacınız Var?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Ödeme konusunda sorun yaşamaya devam ederseniz, destek ekibimiz size yardımcı olmaktan mutluluk duyar.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
                        >
                            <Phone size={18} />
                            İletişime Geç
                        </Link>
                        <Link
                            href="/help"
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                        >
                            <HelpCircle size={18} />
                            Yardım Merkezi
                        </Link>
                    </div>
                </div>

                {/* Alternative Payment Methods */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800 text-center">
                        💡 <strong>İpucu:</strong> Farklı bir kart veya ödeme yöntemi deneyebilirsiniz
                    </p>
                </div>
            </div>
        </div>
    );
}
