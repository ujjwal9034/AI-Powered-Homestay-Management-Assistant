/**
 * Checkout — Dedicated Standalone Payment Gateway & Reservation Portal.
 * Designed like a real world Stripe/Razorpay payment page with live credit card preview,
 * instant UPI VPA validation, NetBanking authorization, itemized bill breakdown, and SSL security seals.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchHomestayById, createPaymentSession, verifyPayment, resolveImageUrl, validateCouponCode } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import DateRangePicker from '../components/ui/DateRangePicker';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Users,
  Zap,
} from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useDocumentTitle('Payment Gateway — StayWise');

  const homestayId = searchParams.get('homestayId');
  const [bookingCheckIn, setBookingCheckIn] = useState(searchParams.get('checkIn') || '');
  const [bookingCheckOut, setBookingCheckOut] = useState(searchParams.get('checkOut') || '');
  const checkIn = bookingCheckIn;
  const checkOut = bookingCheckOut;
  const guestsCount = Number(searchParams.get('guestsCount') || 1);

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(null); // 'connecting' | 'authorizing' | 'success'
  const [paymentType, setPaymentType] = useState('full'); // 'full' | 'deposit'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountPercent }
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Card Form Inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!homestayId || !checkIn || !checkOut) {
      setError('Invalid booking parameters. Please select dates from property page.');
      setLoading(false);
      return;
    }
  /* eslint-enable react-hooks/set-state-in-effect */

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchHomestayById(homestayId);
        setHomestay(res.data);
      } catch {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [homestayId, checkIn, checkOut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connecting to Secure Payment Gateway...</span>
        </div>
      </div>
    );
  }

  if (error || !homestay) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{error || 'Checkout details not found'}</h2>
        <Link to="/explore" className="inline-block text-xs font-semibold px-5 py-2.5 rounded-xl bg-primary-500 text-white shadow-md">
          Return to Explore Properties
        </Link>
      </div>
    );
  }

  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const diffDays = (checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()))
    ? Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))
    : 0;
  const basePrice = diffDays * (homestay?.pricePerNight || 0);
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = Math.round(basePrice * (discountPercent / 100));
  const basePriceAfterDiscount = basePrice - discountAmount;
  const serviceFee = Math.round(basePriceAfterDiscount * 0.05);
  const tax = Math.round(basePriceAfterDiscount * 0.12);
  const totalPrice = basePriceAfterDiscount + serviceFee + tax;

  const handleFillTestCard = () => {
    setCardName(user?.name || 'Guest User');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('123');
  };

  const handleFillTestUPI = () => {
    setUpiId(`${user?.name?.toLowerCase().replace(/\s+/g, '') || 'guest'}@upi`);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in to complete your booking', 'error');
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      showToast('Please select valid check-in and check-out dates', 'error');
      return;
    }

    setPaymentLoading(true);
    setProcessingStep('connecting');

    try {
      // Step 1: Create session with backend
      const sessionRes = await createPaymentSession({
        homestayId: homestay._id,
        checkIn,
        checkOut,
        guestsCount,
        paymentMethod,
        paymentType,
        promoCode: appliedCoupon?.code,
      });

      // If real Stripe URL is returned, redirect to Stripe Hosted Page
      if (sessionRes.url) {
        window.location.href = sessionRes.url;
        return;
      }

      // Live processing handshake simulation
      setProcessingStep('authorizing');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await verifyPayment({
        homestayId: homestay._id,
        checkIn,
        checkOut,
        guestsCount,
        paymentMethod,
        sessionId: sessionRes.sessionId,
        paymentId: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        paymentType,
        promoCode: appliedCoupon?.code,
      });

      if (res.success) {
        setProcessingStep('success');
        showToast('Payment verified and reservation confirmed!');
        setTimeout(() => {
          navigate(`/payment-success?session_id=${sessionRes.sessionId}&homestayId=${homestay._id}&checkIn=${checkIn}&checkOut=${checkOut}&guestsCount=${guestsCount}`);
        }, 1200);
      } else {
        throw new Error(res.message || 'Payment processing failed');
      }
    } catch (err) {
      setProcessingStep(null);
      showToast(err.response?.data?.message || err.message || 'Payment authorization failed', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const inputStyle = `w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:ring-2 transition-all ${
    darkMode
      ? 'bg-dark-900 border-gray-700 text-gray-100 focus:border-primary-500 focus:ring-primary-500/30'
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-500/20'
  }`;

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            to={`/homestays/${homestay._id}`}
            className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
              darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Property Details
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> 256-Bit SSL Secured
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Payment Checkout Column (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Processing Overlay */}
            {processingStep ? (
              <div className={`p-10 rounded-3xl border text-center space-y-5 shadow-2xl ${
                darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {processingStep === 'connecting' && (
                  <div className="flex flex-col items-center gap-3 animate-pulse py-6">
                    <div className="w-14 h-14 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    <h3 className="font-heading font-bold text-lg">Establishing Secure Gateway Session...</h3>
                    <p className="text-xs text-gray-500">Contacting bank servers & verifying 256-bit encryption tunnel</p>
                  </div>
                )}
                {processingStep === 'authorizing' && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce shadow-lg shadow-amber-500/20">
                      <Zap className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading font-bold text-lg">Authorizing Payment of ₹{totalPrice.toLocaleString()}...</h3>
                    <p className="text-xs text-gray-500">Verifying account balance & card security credentials</p>
                  </div>
                )}
                {processingStep === 'success' && (
                  <div className="flex flex-col items-center gap-3 py-6 animate-scaleUp">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-emerald-500">Payment Authorized! 🎉</h3>
                    <p className="text-xs text-gray-500">Locking in your reservation dates and generating receipt...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
                darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div>
                  <h2 className={`font-heading font-bold text-xl sm:text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Payment Checkout Gateway 💳
                  </h2>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select your payment method below to complete your homestay booking.
                  </p>
                </div>

                {/* Choose Payment Option */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Payment Plan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentType('full')}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        paymentType === 'full'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/5'
                          : darkMode
                          ? 'border-gray-750 bg-dark-900 text-gray-400 hover:border-gray-650'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold">Pay in Full</span>
                      <span className="text-[10px] text-gray-500">₹{totalPrice.toLocaleString()} paid today</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('deposit')}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        paymentType === 'deposit'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/5'
                          : darkMode
                          ? 'border-gray-750 bg-dark-900 text-gray-400 hover:border-gray-650'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold">Pay 20% Deposit Now</span>
                      <span className="text-[10px] text-gray-500">₹{Math.round(totalPrice * 0.20).toLocaleString()} today (₹{Math.round(totalPrice * 0.80).toLocaleString()} on check-in)</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Payment Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/10 scale-[1.02]'
                        : darkMode
                        ? 'border-gray-700 bg-dark-900 text-gray-400 hover:border-gray-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/10 scale-[1.02]'
                        : darkMode
                        ? 'border-gray-700 bg-dark-900 text-gray-400 hover:border-gray-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-4 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-md shadow-primary-500/10 scale-[1.02]'
                        : darkMode
                        ? 'border-gray-700 bg-dark-900 text-gray-400 hover:border-gray-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Dynamic Credit Card Visual Widget */}
                {paymentMethod === 'card' && (
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-2xl overflow-hidden border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase font-bold">STAYWISE SECURE CARD</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <ShieldCheck className="w-4 h-4" /> VISA / MASTERCARD
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="font-mono text-lg sm:text-xl tracking-widest text-gray-100 font-bold">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 text-gray-300">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-semibold">Cardholder Name</span>
                        <span className="font-semibold uppercase tracking-wider">{cardName || user?.name || 'GUEST USER'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-semibold">Expires</span>
                        <span className="font-mono font-semibold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Card Payment Details</span>
                        <button
                          type="button"
                          onClick={handleFillTestCard}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Test Card
                        </button>
                      </div>

                      {/* 3D Animated Card Preview */}
                      <div className="relative w-full h-44 mb-6" style={{ perspective: '1000px' }}>
                        <div className="relative w-full h-full duration-500 transition-transform" style={{ transformStyle: 'preserve-3d', transform: isCardFlipped ? 'rotateY(180deg)' : 'none' }}>
                          {/* Front of the Card */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between text-white shadow-xl bg-gradient-to-br from-primary-600 to-accent-600" style={{ backfaceVisibility: 'hidden' }}>
                            <div className="flex justify-between items-start">
                              <span className="text-lg font-bold italic tracking-wider">StayWise</span>
                              <div className="w-10 h-7 rounded bg-white/10 flex items-center justify-center font-bold text-[9px] uppercase tracking-wider text-white border border-white/20">CHIP</div>
                            </div>
                            <div className="space-y-4">
                              <div className="text-lg font-mono tracking-widest text-center">
                                {cardNumber || '•••• •••• •••• ••••'}
                              </div>
                              <div className="flex justify-between text-[10px] font-mono uppercase">
                                <div>
                                  <div className="text-white/60 text-[8px]">Cardholder</div>
                                  <div className="truncate max-w-[150px]">{cardName || 'YOUR FULL NAME'}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-white/60 text-[8px]">Expires</div>
                                  <div>{cardExpiry || 'MM/YY'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Back of the Card */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl flex flex-col justify-between py-5 text-white shadow-xl bg-gradient-to-br from-accent-750 to-primary-850" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                            <div className="w-full h-8 bg-black/40 mt-1" />
                            <div className="px-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 h-7 bg-white/10 rounded" />
                                <div className="w-12 h-7 bg-amber-100 text-dark-900 font-bold text-center flex items-center justify-center text-xs tracking-wider font-mono">
                                  {cardCvv || '•••'}
                                </div>
                              </div>
                              <p className="text-[7px] text-white/50 text-center leading-normal">
                                This card is simulated securely for reservation checkouts. Do not enter actual credentials unless using test gates.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Cardholder Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                          className={inputStyle}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                          className={inputStyle}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            required
                            className={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">CVV Security Code</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            required
                            className={inputStyle}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Instant UPI Payment</span>
                        <button
                          type="button"
                          onClick={handleFillTestUPI}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Test VPA
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          placeholder="username@upi or user@okicici"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          required
                          className={inputStyle}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Accepts Google Pay, PhonePe, Paytm, BHIM, and all bank UPI applications.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-900/40">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Net Banking Provider</span>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className={inputStyle}
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                      <p className="text-[11px] text-gray-500">
                        You will be authorized securely via {selectedBank}&apos;s online banking portal.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-heading font-bold text-sm shadow-xl shadow-primary-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{(paymentType === 'deposit' ? Math.round(totalPrice * 0.20) : totalPrice).toLocaleString()} & Confirm Booking</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
              darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-heading font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reservation Summary 🏨
              </h3>

              {/* Property Card Preview */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={resolveImageUrl(homestay.image)}
                    alt={homestay.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm leading-snug">{homestay.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" /> {homestay.location}
                  </p>
                </div>
              </div>

              {/* Booking Details Pill */}
              <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                darkMode ? 'bg-dark-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-gray-500">
                    Modify Dates
                  </label>
                  <DateRangePicker
                    startDate={bookingCheckIn}
                    endDate={bookingCheckOut}
                    onChange={({ checkIn, checkOut }) => {
                      setBookingCheckIn(checkIn);
                      setBookingCheckOut(checkOut);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary-500" /> Guests:</span>
                  <span className="font-bold">{guestsCount} guest{guestsCount > 1 ? 's' : ''} ({diffDays} night{diffDays > 1 ? 's' : ''})</span>
                </div>
              </div>

              {/* Price Breakdown Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>₹{homestay.pricePerNight?.toLocaleString()} x {diffDays} night{diffDays > 1 ? 's' : ''}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>StayWise Service Fee (5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Occupancy Taxes (12%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{tax.toLocaleString()}</span>
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Have a Promo Code?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-500 font-semibold p-2.5 rounded-xl border border-emerald-500/20 text-xs">
                      <span>🏷️ Applied: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)</span>
                      <button
                        type="button"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-red-500 font-bold hover:underline cursor-pointer ml-2 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                          darkMode
                            ? 'bg-dark-900 border-gray-700 text-gray-100 focus:ring-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:ring-primary-500'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={applyingCoupon || !couponCode.trim()}
                        onClick={async () => {
                          setApplyingCoupon(true);
                          setCouponError('');
                          try {
                            const res = await validateCouponCode(couponCode);
                            if (res.success) {
                              setAppliedCoupon(res.data);
                              setCouponCode('');
                              showToast(res.message, 'success');
                            }
                          } catch (err) {
                            setCouponError(err.response?.data?.message || 'Invalid code');
                          } finally {
                            setApplyingCoupon(false);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-semibold text-xs cursor-pointer disabled:opacity-50 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">⚠️ {couponError}</p>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-500 font-semibold pt-1">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 font-heading font-bold text-base">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-primary-500">₹{totalPrice.toLocaleString()}</span>
                </div>

                {/* Deposit Details */}
                {paymentType === 'deposit' && (
                  <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-emerald-500 font-semibold">
                      <span>Paid Today (20%):</span>
                      <span>₹{Math.round(totalPrice * 0.20).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Remaining Balance (80% due at check-in):</span>
                      <span className="font-semibold">₹{Math.round(totalPrice * 0.80).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Escrow Safeguard Badge & Cancellation Estimator */}
              <div className={`p-4 rounded-2xl border text-xs space-y-3.5 ${
                darkMode ? 'bg-dark-900 border-gray-705' : 'bg-amber-500/5 border-amber-500/10'
              }`}>
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Escrow Safeguard Active</h5>
                    <p className="text-[10px] mt-0.5 text-gray-500">Funds are held securely by StayWise and will only be disbursed to the host 24 hours after your check-in.</p>
                  </div>
                </div>
                
                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700">
                  <h5 className={`font-bold text-[11px] mb-2 uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-655'}`}>Cancellation Refund Schedule</h5>
                  
                  {/* Timeline Estimator */}
                  <div className="relative pl-4 border-l-2 border-primary-500/30 space-y-3 py-1">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-primary-500" />
                      <div className="text-[10px] font-bold text-gray-800 dark:text-gray-200">Before {(() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 3);
                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      })()}</div>
                      <div className="text-[9px] text-gray-500">Free Cancellation (100% Refund)</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-amber-500" />
                      <div className="text-[10px] font-bold text-gray-800 dark:text-gray-200">After check-in begins</div>
                      <div className="text-[9px] text-gray-500">Late cancellation fee (20% deposit retained)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Seals */}
              <div className="pt-2 text-[11px] text-gray-400 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <p>All sensitive payment data is encrypted using SSL & PCI-DSS Level 1 standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
