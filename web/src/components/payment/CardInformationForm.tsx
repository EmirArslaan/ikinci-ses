'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

export interface CardInformation {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
}

interface CardInformationFormProps {
    data: CardInformation;
    onChange: (data: CardInformation) => void;
    errors?: Partial<Record<keyof CardInformation, string>>;
}

export default function CardInformationForm({ data, onChange, errors = {} }: CardInformationFormProps) {
    const [focusedField, setFocusedField] = useState<keyof CardInformation | null>(null);

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g) || [];
        return groups.join(' ').substring(0, 19); // Max 16 digits + 3 spaces
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''));
        onChange({ ...data, cardNumber: formatted });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        onChange({ ...data, expiryDate: formatted });
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
        onChange({ ...data, cvv: value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                <Lock size={20} className="text-[var(--primary)]" />
                Kart Bilgileri
            </h3>

            {/* Virtual Card Display */}
            <div className="relative w-full h-48 rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-[var(--primary-dark)] p-6 shadow-2xl transform transition-transform duration-300 hover:scale-[1.02]">
                <div className="absolute inset-0 rounded-2xl bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative h-full flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                        <CreditCard size={32} className="opacity-90" />
                        <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            İKİNCİ SES
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="font-mono text-xl tracking-wider">
                            {data.cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xs opacity-75 mb-1">Kart Sahibi</div>
                                <div className="font-medium uppercase text-sm">
                                    {data.cardHolder || 'AD SOYAD'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs opacity-75 mb-1">Son Kullanma</div>
                                <div className="font-mono text-sm">
                                    {data.expiryDate || 'AA/YY'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Number Input */}
            <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Kart Numarası
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={data.cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setFocusedField('cardNumber')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="1234 5678 9012 3456"
                        className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              font-mono text-lg
              ${errors.cardNumber
                                ? 'border-red-500 focus:border-red-600'
                                : focusedField === 'cardNumber'
                                    ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                            }
              outline-none
            `}
                    />
                    <CreditCard
                        size={20}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                </div>
                {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
            </div>

            {/* Card Holder Input */}
            <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Kart Sahibinin Adı Soyadı
                </label>
                <input
                    type="text"
                    value={data.cardHolder}
                    onChange={(e) => onChange({ ...data, cardHolder: e.target.value.toUpperCase() })}
                    onFocus={() => setFocusedField('cardHolder')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="AD SOYAD"
                    className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
            uppercase
            ${errors.cardHolder
                            ? 'border-red-500 focus:border-red-600'
                            : focusedField === 'cardHolder'
                                ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                                : 'border-[var(--border)] focus:border-[var(--primary)]'
                        }
            outline-none
          `}
                />
                {errors.cardHolder && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
                )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        Son Kullanma Tarihi
                    </label>
                    <input
                        type="text"
                        value={data.expiryDate}
                        onChange={handleExpiryChange}
                        onFocus={() => setFocusedField('expiryDate')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="AA/YY"
                        className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              font-mono
              ${errors.expiryDate
                                ? 'border-red-500 focus:border-red-600'
                                : focusedField === 'expiryDate'
                                    ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                            }
              outline-none
            `}
                    />
                    {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        CVV
                    </label>
                    <input
                        type="text"
                        value={data.cvv}
                        onChange={handleCvvChange}
                        onFocus={() => setFocusedField('cvv')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="123"
                        className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
              font-mono
              ${errors.cvv
                                ? 'border-red-500 focus:border-red-600'
                                : focusedField === 'cvv'
                                    ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20'
                                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                            }
              outline-none
            `}
                    />
                    {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <Lock size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Güvenli Ödeme</p>
                    <p className="text-green-700">
                        Kart bilgileriniz 256-bit SSL sertifikası ile şifrelenir ve hiçbir şekilde saklanmaz.
                    </p>
                </div>
            </div>
        </div>
    );
}
