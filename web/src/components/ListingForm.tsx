"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Category, Brand } from "@/types";
import { PROMOTION_PACKAGES, PromotionType, calculatePromotionEndDate, formatPrice as formatPromotionPrice } from "@/lib/promotions";

interface ListingFormProps {
    initialData?: any;
    mode: "create" | "edit";
    ticketId?: string;
}

export default function ListingForm({ initialData, mode, ticketId }: ListingFormProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [condition, setCondition] = useState(initialData?.condition || "like-new");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [brandId, setBrandId] = useState(initialData?.brandId || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [showPhone, setShowPhone] = useState(initialData?.showPhone !== false);
    const [location, setLocation] = useState(initialData?.location || "");
    const [images, setImages] = useState<string[]>(initialData?.images || []);

    // Promotion state
    const [selectedPromotions, setSelectedPromotions] = useState<Record<PromotionType, number | null>>({
        featured: null,
        priority: null,
        urgent: null
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");
    const [cardName, setCardName] = useState("");

    // Data state
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    // Auth protection and auto-fill phone
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
        // Auto-fill phone from user data
        if (!initialData?.phone) {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.phone) {
                        setPhone(user.phone);
                    }
                } catch (e) { }
            }
        }
    }, [isLoading, isAuthenticated, router, initialData?.phone]);

    // Fetch categories and brands
    useEffect(() => {
        async function fetchData() {
            try {
                const [catRes, brandRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/brands")
                ]);
                const cats = await catRes.json();
                const brnds = await brandRes.json();
                setCategories(cats);
                setBrands(brnds);

                // Set defaults if creating new and no initial data
                if (mode === "create" && !initialData) {
                    if (cats.length > 0) setCategoryId(cats[0].id);
                    if (brnds.length > 0) setBrandId(brnds[0].id);
                } else if (mode === "edit" && initialData) {
                    // Ensure ids are set correctly if coming from initialData
                    if (!categoryId && cats.length > 0) setCategoryId(cats[0].id); // Fallback if initialData missing it strangely
                }

            } catch (err) {
                console.error("Error fetching data:", err);
            }
        }
        fetchData();
    }, [mode, initialData]); // re-run if mode changes, though usually mount only

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
                } else {
                    console.error("Upload failed:", await res.text());
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Görsel yüklenirken hata oluştu");
        } finally {
            setUploading(false);
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !price || !categoryId || !brandId || !phone) {
            setError("Lütfen tüm zorunlu alanları doldurun");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const currentToken = token || localStorage.getItem("token");
            if (!currentToken) {
                router.push("/auth/login");
                return;
            }

            const url = mode === "create" ? "/api/listings" : `/api/listings/${ticketId}`;
            const method = mode === "create" ? "POST" : "PUT";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    condition,
                    categoryId,
                    brandId,
                    phone,
                    location: location || null,
                    images
                })
            });

            if (res.ok) {
                if (mode === "create") {
                    alert("İlanınız başarıyla oluşturuldu ve onay sürecine alındı.");
                    router.push("/profile");
                } else {
                    alert("İlanınız başarıyla güncellendi ve tekrar onay sürecine alındı.");
                    router.push(`/listings/${ticketId}`);
                }
            } else {
                const data = await res.json();
                setError(data.error || "İşlem sırasında hata oluştu");
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("İşlem sırasında hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // Calculate total promotion cost
    const getTotalPromotionCost = () => {
        let total = 0;
        Object.entries(selectedPromotions).forEach(([type, weeks]) => {
            if (weeks !== null) {
                const pkg = PROMOTION_PACKAGES[type as PromotionType];
                const option = pkg.options.find(o => o.weeks === weeks);
                if (option) total += option.price;
            }
        });
        return total;
    };

    // Toggle promotion selection
    const togglePromotion = (type: PromotionType, weeks: number) => {
        setSelectedPromotions(prev => ({
            ...prev,
            [type]: prev[type] === weeks ? null : weeks
        }));
    };

    // Check if any promotion is selected
    const hasPromotions = () => {
        return Object.values(selectedPromotions).some(v => v !== null);
    };

    // Handle payment and submit
    const handlePaymentSubmit = async () => {
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            alert("Lütfen tüm kart bilgilerini doldurun");
            return;
        }

        setPaymentProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Close modal and submit form with promotions
        setShowPaymentModal(false);
        setPaymentProcessing(false);

        // Submit the form
        await submitListing(true);
    };

    // Submit listing with optional promotions
    const submitListing = async (withPromotions: boolean) => {
        setLoading(true);
        setError("");

        try {
            const currentToken = token || localStorage.getItem("token");
            if (!currentToken) {
                router.push("/auth/login");
                return;
            }

            const url = mode === "create" ? "/api/listings" : `/api/listings/${ticketId}`;
            const method = mode === "create" ? "POST" : "PUT";

            // Build promotion data
            const promotionData: any = {};
            if (withPromotions) {
                if (selectedPromotions.featured) {
                    promotionData.isFeatured = true;
                    promotionData.featuredUntil = calculatePromotionEndDate(selectedPromotions.featured);
                }
                if (selectedPromotions.priority) {
                    promotionData.isPriority = true;
                    promotionData.priorityUntil = calculatePromotionEndDate(selectedPromotions.priority);
                }
                if (selectedPromotions.urgent) {
                    promotionData.isUrgent = true;
                    promotionData.urgentUntil = calculatePromotionEndDate(selectedPromotions.urgent);
                }
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    condition,
                    categoryId,
                    brandId,
                    phone,
                    showPhone,
                    location: location || null,
                    images,
                    ...promotionData
                })
            });

            if (res.ok) {
                if (mode === "create") {
                    alert(withPromotions
                        ? "İlanınız promosyonlarla birlikte oluşturuldu!"
                        : "İlanınız başarıyla oluşturuldu ve onay sürecine alındı."
                    );
                    router.push("/profile");
                } else {
                    alert("İlanınız başarıyla güncellendi.");
                    router.push(`/listings/${ticketId}`);
                }
            } else {
                const data = await res.json();
                setError(data.error || "İşlem sırasında hata oluştu");
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("İşlem sırasında hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // Format price for preview
    const formatPrice = (value: string) => {
        if (!value) return "₺0";
        return "₺" + new Intl.NumberFormat("tr-TR").format(parseFloat(value));
    };

    // Get condition text
    const getConditionText = (cond: string) => {
        const conditions: Record<string, string> = {
            "new": "Sıfır",
            "like-new": "Az Kullanılmış",
            "good": "İyi Durumda",
            "fair": "Kullanılmış",
        };
        return conditions[cond] || cond;
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start w-full">
            {/* Error Message */}
            {error && (
                <div className="w-full lg:hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                    {error}
                </div>
            )}

            {/* Left Column: Form */}
            <div className="flex-1 w-full flex flex-col gap-8">
                {error && (
                    <div className="hidden lg:block bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Section: Instrument Info */}
                <section className="bg-[#f9fafb] border border-[#d1d5db] rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8B4513]">piano</span>
                        Enstrüman Detayları
                    </h3>

                    {/* Title */}
                    <label className="flex flex-col gap-2">
                        <span className="text-gray-900 text-sm font-medium">İlan Başlığı *</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] placeholder:text-[#6b7280] transition-all"
                            placeholder="Örn. Fender Stratocaster 2021 HSS"
                            required
                        />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Kategori *</span>
                            <div className="relative">
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="appearance-none w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] transition-all"
                                    required
                                >
                                    <option value="" disabled>Seçiniz</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">expand_more</span>
                            </div>
                        </label>

                        {/* Condition */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Durum *</span>
                            <div className="relative">
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="appearance-none w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] transition-all"
                                >
                                    <option value="new">Sıfır (Hiç Kullanılmamış)</option>
                                    <option value="like-new">İkinci El (Çok İyi)</option>
                                    <option value="good">İkinci El (İyi)</option>
                                    <option value="fair">İkinci El (Orta)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">expand_more</span>
                            </div>
                        </label>

                        {/* Brand */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Marka *</span>
                            <div className="relative">
                                <select
                                    value={brandId}
                                    onChange={(e) => setBrandId(e.target.value)}
                                    className="appearance-none w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] transition-all"
                                    required
                                >
                                    <option value="" disabled>Seçiniz</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">expand_more</span>
                            </div>
                        </label>

                        {/* Location */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Konum</span>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] placeholder:text-[#6b7280] transition-all"
                                placeholder="Örn. Kadıköy, İstanbul"
                            />
                        </label>
                    </div>

                    {/* Description */}
                    <label className="flex flex-col gap-2">
                        <span className="text-gray-900 text-sm font-medium">Açıklama *</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] placeholder:text-[#6b7280] transition-all resize-none"
                            placeholder="Enstrümanın hikayesi, modifikasyonlar ve detaylı durum bilgisi..."
                            rows={4}
                            required
                        />
                        <p className="text-xs text-[#6b7280] text-right">{description.length}/2000 karakter</p>
                    </label>
                </section>

                {/* Section: Pricing */}
                <section className="bg-[#f9fafb] border border-[#d1d5db] rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8B4513]">payments</span>
                        Fiyatlandırma & İletişim
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Satış Fiyatı (TL) *</span>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-bold">₺</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-[#ffffff] border border-[#d1d5db] text-gray-900 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 focus:border-[#8B4513] placeholder:text-[#6b7280] transition-all text-lg font-bold"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </label>

                        {/* Phone */}
                        <label className="flex flex-col gap-2">
                            <span className="text-gray-900 text-sm font-medium">Telefon Numarası *</span>
                            <input
                                type="tel"
                                value={phone}
                                readOnly
                                className="w-full bg-gray-100 border border-[#d1d5db] text-gray-600 rounded-xl px-4 py-3.5 cursor-not-allowed"
                                placeholder="Telefon numaranız"
                            />
                            <p className="text-xs text-gray-500">Telefon numaranız hesap bilgilerinizden alınmıştır</p>
                        </label>

                        {/* Show Phone Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPhone}
                                onChange={(e) => setShowPhone(e.target.checked)}
                                className="size-5 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                            />
                            <span className="text-sm text-gray-700">
                                Telefon numaramı ilanda göster
                            </span>
                        </label>
                    </div>
                </section>

                {/* Section: Media */}
                <section className="bg-[#f9fafb] border border-[#d1d5db] rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#8B4513]">imagesmode</span>
                            Fotoğraflar
                        </h3>
                        <span className="text-xs text-[#6b7280] bg-[#ffffff] px-2 py-1 rounded-md">Maks. 10 fotoğraf</span>
                    </div>

                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d1d5db] hover:border-[#8B4513] rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group bg-[#ffffff]"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="size-16 rounded-full bg-[#d1d5db] flex items-center justify-center group-hover:bg-[#8B4513]/20 transition-colors">
                            {uploading ? (
                                <span className="material-symbols-outlined text-3xl text-[#8B4513] animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-3xl text-[#6b7280] group-hover:text-[#8B4513]">add_a_photo</span>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-gray-900 font-medium mb-1">
                                {uploading ? "Yükleniyor..." : "Fotoğrafları sürükleyip bırakın"}
                            </p>
                            <p className="text-sm text-[#6b7280]">veya dosya seçmek için tıklayın</p>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                                    <img className="w-full h-full object-cover" src={img} alt={`Görsel ${idx + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-gray-900 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-xs block">close</span>
                                    </button>
                                    {idx === 0 && (
                                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-gray-900 text-[10px] px-2 py-1 text-center">Kapak</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Section: Promotions (only for create mode) */}
                {mode === "create" && (
                    <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600">stars</span>
                                İlanınızı Öne Çıkarın
                            </h3>
                            <span className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-medium">Opsiyonel</span>
                        </div>

                        <p className="text-gray-600 text-sm">
                            Promosyon paketleri ile ilanınızı daha fazla kişiye ulaştırın ve daha hızlı satış yapın.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(PROMOTION_PACKAGES).map(([key, pkg]) => {
                                const type = key as PromotionType;
                                const isSelected = selectedPromotions[type] !== null;
                                const colorClasses = {
                                    amber: { bg: 'bg-amber-500', border: 'border-amber-400', light: 'bg-amber-100' },
                                    blue: { bg: 'bg-blue-500', border: 'border-blue-400', light: 'bg-blue-100' },
                                    red: { bg: 'bg-red-500', border: 'border-red-400', light: 'bg-red-100' }
                                }[pkg.color] || { bg: 'bg-gray-500', border: 'border-gray-400', light: 'bg-gray-100' };

                                return (
                                    <div
                                        key={key}
                                        className={`rounded-xl p-4 border-2 transition-all ${isSelected ? `${colorClasses.border} ${colorClasses.light}` : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`size-10 rounded-full ${colorClasses.bg} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-white text-xl">{pkg.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                                                <p className="text-xs text-gray-500">{pkg.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {pkg.options.map(option => (
                                                <button
                                                    key={option.weeks}
                                                    type="button"
                                                    onClick={() => togglePromotion(type, option.weeks)}
                                                    className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedPromotions[type] === option.weeks
                                                        ? `${colorClasses.bg} text-white`
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <div>{option.label}</div>
                                                    <div className="text-xs opacity-80">{formatPromotionPrice(option.price)}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total Cost */}
                        {hasPromotions() && (
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200">
                                <span className="font-medium text-gray-900">Toplam Promosyon Tutarı:</span>
                                <span className="text-2xl font-black text-amber-600">{formatPromotionPrice(getTotalPromotionCost())}</span>
                            </div>
                        )}
                    </section>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <Link
                        href={mode === "create" ? "/listings" : `/listings/${ticketId}`}
                        className="flex items-center gap-2 px-6 h-12 rounded-full border border-[#d1d5db] text-gray-900 font-bold hover:bg-[#d1d5db] transition-colors"
                    >
                        İptal
                    </Link>

                    <div className="flex gap-3">
                        {/* Skip promotions button */}
                        {mode === "create" && hasPromotions() && (
                            <button
                                type="button"
                                onClick={() => submitListing(false)}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 h-12 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Promosyonsuz Yayınla
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                if (!title || !description || !price || !categoryId || !brandId || !phone) {
                                    setError("Lütfen tüm zorunlu alanları doldurun");
                                    return;
                                }
                                if (hasPromotions()) {
                                    setShowPaymentModal(true);
                                } else {
                                    submitListing(false);
                                }
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 h-12 rounded-full bg-[#8B4513] text-white font-bold hover:bg-[#A0522D] transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Kaydediliyor..." : (
                                hasPromotions()
                                    ? `${formatPromotionPrice(getTotalPromotionCost())} Öde ve Yayınla`
                                    : (mode === "create" ? "İlanı Yayınla" : "Değişiklikleri Kaydet")
                            )}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-28 flex flex-col gap-4">
                    <h4 className="text-[#6b7280] text-sm font-bold uppercase tracking-wider ml-1">Önizleme</h4>

                    {/* Preview Card */}
                    <div className="w-full bg-[#f9fafb] border border-[#d1d5db] rounded-2xl overflow-hidden shadow-lg flex flex-col">
                        <div className="relative aspect-[4/3] w-full bg-black">
                            {images.length > 0 ? (
                                <img className="w-full h-full object-cover" src={images[0]} alt="Ön izleme" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                                    <span className="material-symbols-outlined text-5xl">image</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-gray-900 text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                                {getConditionText(condition)}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-[#8B4513] font-bold mb-1">
                                        {brands.find(b => b.id === brandId)?.name || "Marka"}
                                    </p>
                                    <h3 className="text-gray-900 font-bold text-lg leading-tight">
                                        {title || "İlan Başlığı"}
                                    </h3>
                                </div>
                                <button type="button" className="text-[#6b7280] hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined">favorite</span>
                                </button>
                            </div>
                            {location && (
                                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {location}
                                </div>
                            )}
                            <div className="h-px w-full bg-[#d1d5db] my-1"></div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-900 font-black text-xl">{formatPrice(price)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tips Card */}
                    <div className="bg-[#8B4513]/10 border border-[#8B4513]/20 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[#8B4513] font-bold text-sm">
                            <span className="material-symbols-outlined text-lg">lightbulb</span>
                            İpucu
                        </div>
                        <p className="text-[#6b7280] text-xs leading-relaxed">
                            {mode === "create"
                                ? "Detaylı ve dürüst açıklamalar yazmak, ürününüzün %40 daha hızlı satılmasını sağlar. Enstrümanınızdaki çizikleri belirtmekten çekinmeyin."
                                : "İlanınızı güncellediğinizde güvenlik gereği tekrar onay sürecine girecektir. Lütfen bilgilerinizi dikkatlice kontrol ediniz."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Ödeme Bilgileri</h3>
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Sipariş Özeti</h4>
                            <div className="space-y-2 text-sm">
                                {selectedPromotions.featured && (
                                    <div className="flex justify-between">
                                        <span>Ana Sayfa Vitrini ({selectedPromotions.featured} hafta)</span>
                                        <span className="font-medium">
                                            {formatPromotionPrice(PROMOTION_PACKAGES.featured.options.find(o => o.weeks === selectedPromotions.featured)?.price || 0)}
                                        </span>
                                    </div>
                                )}
                                {selectedPromotions.priority && (
                                    <div className="flex justify-between">
                                        <span>Üst Sıra ({selectedPromotions.priority} hafta)</span>
                                        <span className="font-medium">
                                            {formatPromotionPrice(PROMOTION_PACKAGES.priority.options.find(o => o.weeks === selectedPromotions.priority)?.price || 0)}
                                        </span>
                                    </div>
                                )}
                                {selectedPromotions.urgent && (
                                    <div className="flex justify-between">
                                        <span>Acil İlan ({selectedPromotions.urgent} hafta)</span>
                                        <span className="font-medium">
                                            {formatPromotionPrice(PROMOTION_PACKAGES.urgent.options.find(o => o.weeks === selectedPromotions.urgent)?.price || 0)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                    <span>Toplam</span>
                                    <span className="text-amber-600">{formatPromotionPrice(getTotalPromotionCost())}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                    placeholder="AD SOYAD"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma</label>
                                    <input
                                        type="text"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="MM/YY"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                    <input
                                        type="text"
                                        value={cardCvc}
                                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        placeholder="123"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handlePaymentSubmit}
                            disabled={paymentProcessing}
                            className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {paymentProcessing ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Ödeme İşleniyor...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">lock</span>
                                    {formatPromotionPrice(getTotalPromotionCost())} Öde
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            🔒 Ödeme bilgileriniz güvenle işlenmektedir
                        </p>
                    </div>
                </div>
            )}
        </form>
    );
}
