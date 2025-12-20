"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Category } from "@/types";
import { QA_PROMOTION_PACKAGES, QAPromotionSelection, calculateQAPromotionEndDate, formatQAPrice } from "@/lib/qa-promotions";

export default function CreateQuestionPage() {
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Data
    const [categories, setCategories] = useState<Category[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Promotion state
    const [selectedPromotions, setSelectedPromotions] = useState<QAPromotionSelection>({
        featured: null,
        priority: null,
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");
    const [cardName, setCardName] = useState("");

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    if (data.length > 0) setCategoryId(data[0].id);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        }
        fetchCategories();
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login?redirect=/questions/create");
        }
    }, [authLoading, isAuthenticated, router]);

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const currentToken = token || localStorage.getItem("token");

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentToken}`
                    },
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    setImages(prev => [...prev, data.url]);
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Görsel yüklenirken hata oluştu");
        } finally {
            setUploading(false);
        }
    };

    // Promotion helpers
    const getTotalPromotionCost = () => {
        let total = 0;
        if (selectedPromotions.featured) {
            const option = QA_PROMOTION_PACKAGES.featured.options.find(o => o.weeks === selectedPromotions.featured);
            if (option) total += option.price;
        }
        if (selectedPromotions.priority) {
            const option = QA_PROMOTION_PACKAGES.priority.options.find(o => o.weeks === selectedPromotions.priority);
            if (option) total += option.price;
        }
        return total;
    };

    const togglePromotion = (type: 'featured' | 'priority', weeks: number) => {
        setSelectedPromotions(prev => ({
            ...prev,
            [type]: prev[type] === weeks ? null : weeks
        }));
    };

    const hasPromotions = () => selectedPromotions.featured !== null || selectedPromotions.priority !== null;

    // Submit handlers
    const handlePaymentSubmit = async () => {
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            setError("Tüm kart bilgilerini doldurun");
            return;
        }

        setPaymentProcessing(true);
        // Simulate payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentProcessing(false);
        setShowPaymentModal(false);

        await submitQuestion(true);
    };

    const submitQuestion = async (withPromotions: boolean) => {
        if (!title || !description || !categoryId) {
            setError("Başlık, açıklama ve kategori zorunludur");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const currentToken = token || localStorage.getItem("token");

            const body: any = {
                title,
                description,
                images,
                categoryId,
            };

            if (withPromotions && hasPromotions()) {
                if (selectedPromotions.featured) {
                    body.isFeatured = true;
                    body.featuredUntil = calculateQAPromotionEndDate(selectedPromotions.featured).toISOString();
                }
                if (selectedPromotions.priority) {
                    body.isPriority = true;
                    body.priorityUntil = calculateQAPromotionEndDate(selectedPromotions.priority).toISOString();
                }
            }

            const res = await fetch("/api/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Soru oluşturulamadı");
            }

            router.push("/questions?success=created");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-purple-500">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/questions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Geri
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Soru Sor</h1>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Soru Başlığı *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Örn: Gitar tellerini ne sıklıkla değiştirmeliyim?"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Sorunuzu detaylı bir şekilde açıklayın..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Görseller (opsiyonel)
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                                {uploading ? (
                                    <span className="material-symbols-outlined animate-spin text-gray-400">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                                        <span className="text-xs text-gray-400 mt-1">Ekle</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Promotions */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">campaign</span>
                        Sorunuzu Öne Çıkarın
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(QA_PROMOTION_PACKAGES).map(([key, pkg]) => {
                            const type = key as 'featured' | 'priority';
                            const colorClasses = {
                                amber: { bg: 'bg-amber-500', border: 'border-amber-400', light: 'bg-amber-100' },
                                blue: { bg: 'bg-blue-500', border: 'border-blue-400', light: 'bg-blue-100' }
                            }[pkg.color] || { bg: 'bg-gray-500', border: 'border-gray-400', light: 'bg-gray-100' };

                            return (
                                <div key={key} className={`rounded-xl border-2 p-4 ${selectedPromotions[type] ? colorClasses.border : 'border-gray-200'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-full ${colorClasses.bg} flex items-center justify-center text-white`}>
                                            <span className="material-symbols-outlined">{pkg.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                                            <p className="text-xs text-gray-500">{pkg.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {pkg.options.map((opt) => (
                                            <button
                                                key={opt.weeks}
                                                type="button"
                                                onClick={() => togglePromotion(type, opt.weeks)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPromotions[type] === opt.weeks
                                                    ? `${colorClasses.bg} text-white`
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.label} - {formatQAPrice(opt.price)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasPromotions() && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-xl flex items-center justify-between">
                            <span className="font-medium text-purple-900">Toplam Promosyon Tutarı:</span>
                            <span className="text-xl font-bold text-purple-600">{formatQAPrice(getTotalPromotionCost())}</span>
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {hasPromotions() ? (
                        <>
                            <button
                                type="button"
                                onClick={() => submitQuestion(false)}
                                disabled={loading}
                                className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Promosyonsuz Gönder
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(true)}
                                disabled={loading}
                                className="flex-1 py-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">payment</span>
                                {formatQAPrice(getTotalPromotionCost())} Öde ve Gönder
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => submitQuestion(false)}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined">send</span>
                            )}
                            Soruyu Gönder
                        </button>
                    )}
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                    * Sorunuz admin onayından sonra yayınlanacaktır
                </p>
            </main >

            {/* Payment Modal */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Ödeme Bilgileri</h3>
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Sipariş Özeti</h4>
                                <div className="space-y-2 text-sm">
                                    {selectedPromotions.featured && (
                                        <div className="flex justify-between">
                                            <span>Ana Sayfa ({selectedPromotions.featured} hafta)</span>
                                            <span className="font-medium">
                                                {formatQAPrice(QA_PROMOTION_PACKAGES.featured.options.find(o => o.weeks === selectedPromotions.featured)?.price || 0)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedPromotions.priority && (
                                        <div className="flex justify-between">
                                            <span>Üst Sıra ({selectedPromotions.priority} hafta)</span>
                                            <span className="font-medium">
                                                {formatQAPrice(QA_PROMOTION_PACKAGES.priority.options.find(o => o.weeks === selectedPromotions.priority)?.price || 0)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                        <span>Toplam</span>
                                        <span className="text-purple-600">{formatQAPrice(getTotalPromotionCost())}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="AD SOYAD" className="w-full border border-gray-300 rounded-lg px-4 py-3 uppercase" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma</label>
                                        <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                        <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePaymentSubmit}
                                disabled={paymentProcessing}
                                className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {paymentProcessing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Ödeme İşleniyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">lock</span>
                                        {formatQAPrice(getTotalPromotionCost())} Öde
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">🔒 Ödeme bilgileriniz güvenle işlenmektedir</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
