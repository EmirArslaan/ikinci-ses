'use client';

import { CreditCard, Building2 } from 'lucide-react';

export type PaymentMethod = 'credit_card' | 'debit_card';

interface PaymentMethodSelectorProps {
    selected: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
    const methods = [
        {
            id: 'credit_card' as PaymentMethod,
            icon: CreditCard,
            title: 'Kredi Kartı',
            description: 'Tüm kredi kartları kabul edilir'
        },
        {
            id: 'debit_card' as PaymentMethod,
            icon: CreditCard,
            title: 'Banka Kartı',
            description: 'Banka kartlarınızla güvenle ödeme yapın'
        }
    ];

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--text)]">Ödeme Yöntemi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selected === method.id;

                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => onChange(method.id)}
                            className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg
                ${isSelected
                                    ? 'border-[var(--primary)] bg-gradient-to-br from-[#8B4513]/5 to-[#A0522D]/10 shadow-md'
                                    : 'border-[var(--border)] bg-white hover:border-[var(--primary-light)]'
                                }
              `}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`
                  p-3 rounded-xl transition-colors duration-300
                  ${isSelected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background-alt)] text-[var(--text-muted)]'}
                `}>
                                    <Icon size={24} />
                                </div>

                                <div className="flex-1 text-left">
                                    <h4 className={`font-semibold mb-1 transition-colors duration-300 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text)]'
                                        }`}>
                                        {method.title}
                                    </h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
