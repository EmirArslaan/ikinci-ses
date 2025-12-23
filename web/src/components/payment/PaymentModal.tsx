'use client';

import { useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';
import CardInformationForm, { CardInformation } from './CardInformationForm';
import PromotionPackages, { PromotionPackage } from './PromotionPackages';
import PaymentSummary from './PaymentSummary';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    listingTitle: string;
}

type Step = 'packages' | 'payment' | 'confirm';

export default function PaymentModal({ isOpen, onClose, listingId, listingTitle }: PaymentModalProps) {
    const [step, setStep] = useState<Step>('packages');
    const [selectedPackages, setSelectedPackages] = useState<PromotionPackage[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
    const [cardInfo, setCardInfo] = useState<CardInformation>({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardInformation, string>>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const validateCardInfo = (): boolean => {
        const errors: Partial<Record<keyof CardInformation, string>> = {};

        // Card number validation (16 digits)
        const cardNumberDigits = cardInfo.cardNumber.replace(/\s/g, '');
        if (!cardNumberDigits || cardNumberDigits.length !== 16) {
            errors.cardNumber = 'Geçerli bir kart numarası girin (16 hane)';
        }

        // Card holder validation
        if (!cardInfo.cardHolder || cardInfo.cardHolder.trim().length < 3) {
            errors.cardHolder = 'Kart üzerindeki ismi girin';
        }

        // Expiry date validation (MM/YY)
        const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryPattern.test(cardInfo.expiryDate)) {
            errors.expiryDate = 'Geçerli bir tarih girin (AA/YY)';
        } else {
            const [month, year] = cardInfo.expiryDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            const expYear = parseInt(year);
            const expMonth = parseInt(month);

            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                errors.expiryDate = 'Kartınızın süresi dolmuş';
            }
        }

        // CVV validation (3 digits)
        if (!cardInfo.cvv || cardInfo.cvv.length !== 3) {
            errors.cvv = 'Geçerli bir CVV girin (3 hane)';
        }

        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePayment = async () => {
        if (step === 'packages') {
            if (selectedPackages.length === 0) {
                alert('Lütfen en az bir promosyon paketi seçin');
                return;
            }
            setStep('payment');
            return;
        }

        if (step === 'payment') {
            if (!validateCardInfo()) {
                return;
            }
            setStep('confirm');
            return;
        }

        if (step === 'confirm') {
            setIsProcessing(true);

            try {
                const response = await fetch('/api/payments/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        listingId,
                        promotions: selectedPackages
                    })
                });

                const data = await response.json();

                if (data.success && data.iframeUrl) {
                    // Redirect to PayTR payment page
                    window.location.href = data.iframeUrl;
                } else {
                    alert(data.error || 'Ödeme başlatılamadı');
                    setIsProcessing(false);
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Bir hata oluştu. Lütfen tekrar deneyin.');
                setIsProcessing(false);
            }
        }
    };

    const handleBack = () => {
        if (step === 'payment') {
            setStep('packages');
        } else if (step === 'confirm') {
            setStep('payment');
        }
    };

    if (!isOpen) return null;

    const steps = [
        { id: 'packages', label: 'Paket Seçimi' },
        { id: 'payment', label: 'Ödeme Bilgileri' },
        { id: 'confirm', label: 'Onay' }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-7xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-300 hover:scale-110"
                >
                    <X size={24} className="text-[var(--text)]" />
                </button>

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white">
                    <h2 className="text-2xl font-bold mb-2">İlanı Öne Çıkar</h2>
                    <p className="text-white/90 text-sm">{listingTitle}</p>

                    {/* Progress Bar */}
                    <div className="mt-6 flex items-center gap-2">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${idx <= currentStepIndex
                                            ? 'bg-white text-[var(--primary)]'
                                            : 'bg-white/30 text-white/70'
                                        }
                  `}>
                                        {idx + 1}
                                    </div>
                                    <span className={`
                    text-sm font-medium hidden md:block
                    ${idx <= currentStepIndex ? 'text-white' : 'text-white/60'}
                  `}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`
                    h-1 flex-1 mx-2 rounded-full transition-all duration-300
                    ${idx < currentStepIndex ? 'bg-white' : 'bg-white/30'}
                  `} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-220px)]">
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {step === 'packages' && (
                                    <PromotionPackages
                                        selected={selectedPackages}
                                        onChange={setSelectedPackages}
                                    />
                                )}

                                {step === 'payment' && (
                                    <div className="space-y-6">
                                        <PaymentMethodSelector
                                            selected={paymentMethod}
                                            onChange={setPaymentMethod}
                                        />
                                        <CardInformationForm
                                            data={cardInfo}
                                            onChange={setCardInfo}
                                            errors={cardErrors}
                                        />
                                    </div>
                                )}

                                {step === 'confirm' && (
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200">
                                            <h3 className="text-xl font-bold text-green-900 mb-4">
                                                ✓ Bilgileriniz Hazır
                                            </h3>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-green-700">Paket Sayısı: </span>
                                                    <span className="font-semibold text-green-900">{selectedPackages.length} adet</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-700">Ödeme Yöntemi: </span>
                                                    <span className="font-semibold text-green-900">
                                                        {paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Banka Kartı'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-green-700">Kart: </span>
                                                    <span className="font-semibold text-green-900">
                                                        •••• •••• •••• {cardInfo.cardNumber.slice(-4)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
                                            <h4 className="font-semibold text-blue-900 mb-2">
                                                📋 Önemli Bilgiler
                                            </h4>
                                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                                <li>Ödemeniz güvenli PayTR altyapısıyla işlenecektir</li>
                                                <li>Promosyon paketleri ödeme sonrası otomatik aktifleşir</li>
                                                <li>E-posta adresinize fatura gönderilecektir</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <PaymentSummary
                                    packages={selectedPackages}
                                    isLoading={isProcessing}
                                    onProceed={handlePayment}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[var(--background-alt)] border-t border-[var(--border)] flex justify-between">
                    <button
                        onClick={step === 'packages' ? onClose : handleBack}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-xl font-semibold text-[var(--text)] bg-white border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        {step === 'packages' ? 'İptal' : 'Geri'}
                    </button>

                    {selectedPackages.length > 0 && (
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="px-6 py-3 rounded-xl font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 lg:hidden"
                        >
                            {step === 'confirm' ? 'Ödemeyi Tamamla' : 'Devam Et'}
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
