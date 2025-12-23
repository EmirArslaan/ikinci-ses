"use client";

import { useState, useEffect } from "react";

interface PriceRangeSliderProps {
    defaultMin?: number;
    defaultMax?: number;
    onChange: (min: number, max: number) => void;
}

export default function PriceRangeSlider({
    defaultMin = 0,
    defaultMax = 0,
    onChange
}: PriceRangeSliderProps) {
    const [minValue, setMinValue] = useState(defaultMin);
    const [maxValue, setMaxValue] = useState(defaultMax);
    const [minInput, setMinInput] = useState(defaultMin.toString());
    const [maxInput, setMaxInput] = useState(defaultMax.toString());

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(minValue, maxValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [minValue, maxValue, onChange]);

    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMinInput(value);

        // Boş string veya sadece sıfır kontrolü
        if (value === '' || value === '-') {
            return;
        }

        const numValue = Number(value);

        // Sıfırdan küçük olamaz
        if (numValue < 0) {
            setMinInput('0');
            setMinValue(0);
            return;
        }

        setMinValue(numValue);
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMaxInput(value);

        // Boş string veya sadece sıfır kontrolü
        if (value === '' || value === '-') {
            return;
        }

        const numValue = Number(value);

        // Sıfırdan küçük olamaz
        if (numValue < 0) {
            setMaxInput('0');
            setMaxValue(0);
            return;
        }

        setMaxValue(numValue);
    };

    const handleMinBlur = () => {
        // Input boşsa veya geçersizse 0 yap
        if (minInput === '' || minInput === '-' || isNaN(Number(minInput))) {
            setMinInput('0');
            setMinValue(0);
        }
    };

    const handleMaxBlur = () => {
        // Input boşsa veya geçersizse 0 yap
        if (maxInput === '' || maxInput === '-' || isNaN(Number(maxInput))) {
            setMaxInput('0');
            setMaxValue(0);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{formatPrice(minValue)}</span>
                <span className="text-gray-400">-</span>
                <span>{formatPrice(maxValue)}</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">En Az</label>
                    <input
                        type="number"
                        value={minInput}
                        onChange={handleMinInputChange}
                        onBlur={handleMinBlur}
                        min={0}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8B4513] focus:ring-0 focus:outline-none"
                        placeholder="0"
                    />
                </div>
                <span className="text-gray-400 mt-5">-</span>
                <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">En Çok</label>
                    <input
                        type="number"
                        value={maxInput}
                        onChange={handleMaxInputChange}
                        onBlur={handleMaxBlur}
                        min={0}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#8B4513] focus:ring-0 focus:outline-none"
                        placeholder="0"
                    />
                </div>
            </div>

            <p className="text-xs text-gray-500">
                Fiyat aralığını belirlemek için istediğiniz değerleri girebilirsiniz.
            </p>
        </div>
    );
}
