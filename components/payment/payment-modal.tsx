'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, Check, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/graphql-client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cognitoUserId: string;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, cognitoUserId, onSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (paymentStep === 'success') {
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#f97316', '#fb923c', '#fbbf24', '#fcd34d']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#f97316', '#fb923c', '#fbbf24', '#fcd34d']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [paymentStep]);

  if (!isOpen) return null;

  const fillDummyData = () => {
    setFormData({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: 'John Doe',
      expiryMonth: '12',
      expiryYear: '25',
      cvv: '123'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // 16 digits + 3 spaces
    }

    // Validate expiry month
    if (field === 'expiryMonth') {
      const month = parseInt(value);
      if (value.length > 2 || month > 12) return;
    }

    // Validate expiry year
    if (field === 'expiryYear') {
      if (value.length > 2) return;
    }

    // Validate CVV
    if (field === 'cvv') {
      if (value.length > 4) return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Please enter the cardholder name';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setPaymentStep('processing');
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await api.upgradeUserToPaid(cognitoUserId);
      
      if (result.success) {
        setPaymentStep('success');
        // Sign out and redirect to login after 5 seconds to allow user to read the message
        setTimeout(async () => {
          await signOut();
          router.push('/login?upgraded=true');
        }, 5000);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
      setPaymentStep('form');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-white/90">Get unlimited access to all features - One-time payment</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {paymentStep === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fill Dummy Data Badge */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-grey-600">Enter your card details below</p>
                  <button
                    type="button"
                    onClick={fillDummyData}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Use Test Card
                  </button>
                </div>

                {/* Card Number */}
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/[^0-9\s]/g, ''))}
                      className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Card Holder */}
                <div>
                  <Label htmlFor="cardHolder">Cardholder Name</Label>
                  <Input
                    id="cardHolder"
                    type="text"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                    className={errors.cardHolder ? 'border-red-500' : ''}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                  {errors.cardHolder && (
                    <p className="text-sm text-red-500 mt-1">{errors.cardHolder}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expiry Date</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="MM"
                        maxLength={2}
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value.replace(/[^0-9]/g, ''))}
                        className={`w-16 ${errors.expiry ? 'border-red-500' : ''}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                      />
                      <Input
                        type="text"
                        placeholder="YY"
                        maxLength={2}
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value.replace(/[^0-9]/g, ''))}
                        className={`w-16 ${errors.expiry ? 'border-red-500' : ''}`}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                      />
                    </div>
                    {errors.expiry && (
                      <p className="text-sm text-red-500 mt-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/[^0-9]/g, ''))}
                      className={errors.cvv ? 'border-red-500' : ''}
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    {errors.cvv && (
                      <p className="text-sm text-red-500 mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Test Card Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Test Mode:</strong> You can enter any card details or use our test card
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Test card: 4242 4242 4242 4242 | Any future expiry | Any 3-digit CVV
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  disabled={isProcessing}
                >
                  Pay $49.99 - One Time
                </Button>

                <p className="text-xs text-center text-grey-500">
                  By upgrading, you agree to our terms of service and privacy policy
                </p>
              </form>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                <p className="text-grey-600">Please wait while we process your upgrade...</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <PartyPopper className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-grey-900">Congratulations! 🎉</h3>
                <p className="text-lg text-grey-700 font-medium">Welcome to Pro!</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mx-auto max-w-sm">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> You'll be redirected to sign in again to activate your Pro features.
                  </p>
                </div>
                <p className="text-sm text-grey-500">Redirecting in a few seconds...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}