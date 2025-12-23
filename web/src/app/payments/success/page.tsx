import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const merchantOid = params.merchant_oid as string;

    if (!merchantOid) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6 animate-bounce">
                        <CheckCircle size={64} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-green-900 mb-2">
                        Ödeme Başarılı!
                    </h1>
                    <p className="text-lg text-green-700">
                        İşleminiz başarıyla tamamlandı
                    </p>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
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
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Tamamlandı
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Promosyon Paketleriniz Aktifleştirildi
                        </h3>
                        <p className="text-sm text-green-800 mb-4">
                            İlanınız seçtiğiniz promosyon paketleriyle artık öne çıkıyor.
                            E-posta adresinize detaylı fatura gönderilmiştir.
                        </p>
                        <ul className="text-sm text-green-700 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                Promosyonlar hemen aktif oldu
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                Daha fazla görüntüleme alacaksınız
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                İstatistiklerinizi takip edebilirsiniz
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Link
                        href="/profile"
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                        İlanlarıma Git
                        <ArrowRight size={20} />
                    </Link>

                    <Link
                        href="/profile/payments"
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-[var(--text)] font-semibold border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300"
                    >
                        <Download size={20} />
                        Ödeme Geçmişi
                    </Link>
                </div>

                {/* Share Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Share2 size={20} />
                        İlanınızı Paylaşın
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Sosyal medyada paylaşarak daha fazla kişiye ulaşın
                    </p>
                    <div className="flex gap-3">
                        <button className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all">
                            Facebook
                        </button>
                        <button className="flex-1 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-all">
                            Twitter
                        </button>
                        <button className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-all">
                            WhatsApp
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    Herhangi bir sorunuz varsa{' '}
                    <Link href="/contact" className="text-[var(--primary)] hover:underline">
                        destek ekibimizle
                    </Link>{' '}
                    iletişime geçebilirsiniz.
                </p>
            </div>
        </div>
    );
}
