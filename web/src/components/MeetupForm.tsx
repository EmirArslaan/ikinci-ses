
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MeetupForm() {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("CONCERT");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState("");


    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

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
                    headers: { "Authorization": `Bearer ${currentToken}` },
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    setImages(prev => [...prev, data.url]);
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const currentToken = token || localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${currentToken}` },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setVideoUrl(data.url);
            }
        } catch (err) {
            console.error("Video upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const currentToken = token || localStorage.getItem("token");
            const res = await fetch("/api/meetups", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    date: type === 'COVERS' ? new Date().toISOString() : date,
                    location: type === 'COVERS' ? 'Online' : location,
                    type,
                    price: type === 'COVERS' ? 0 : (price ? parseFloat(price) : null),
                    images,
                    videoUrl
                }),
            });

            if (res.ok) {
                router.push("/meetups");
            } else {
                const data = await res.json();
                setError(data.error || "Hata oluştu");
            }
        } catch (err) {
            setError("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-pink-100">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Başlık</label>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                        placeholder="Örn: Kadıköy Caz Gecesi"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kategori</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    >
                        <option value="CONCERT">Konser</option>
                        <option value="LESSON">Ders</option>
                        <option value="BAND">Grup Üyesi</option>
                        <option value="GEAR">Ödünç Ekipman</option>
                        <option value="STUDIO">Stüdyo</option>
                        <option value="COVERS">Coverlar</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
                    placeholder="Etkinlik veya duyuru detayları..."
                />
            </div>

            {type !== 'COVERS' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tarih</label>
                        <input
                            required
                            type="datetime-local"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Konum</label>
                        <input
                            required
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                            placeholder="Örn: Moda Sahnesi"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Ücret (TL)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                            placeholder="0 ise ücretsiz"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Görseller</label>
                <div className="flex flex-wrap gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-xs block">close</span>
                            </button>
                        </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all text-gray-400 hover:text-pink-500">
                        {uploading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">add_photo_alternate</span>
                                <span className="text-xs mt-1">Ekle</span>
                            </>
                        )}
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {type === 'COVERS' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cover Videosu</label>
                    <div className="space-y-4">
                        {videoUrl ? (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                <video src={videoUrl} controls className="w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => setVideoUrl("")}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all text-gray-400 hover:text-pink-500">
                                {uploading ? (
                                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-4xl mb-2">movie</span>
                                        <span className="text-sm font-medium">Video Yükle</span>
                                        <span className="text-xs text-gray-400 mt-1">MP4, WebM (Max 50MB)</span>
                                    </>
                                )}
                                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            )}


            <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                    <span className="material-symbols-outlined">check</span>
                )}
                Oluştur
            </button>
        </form>
    );
}
