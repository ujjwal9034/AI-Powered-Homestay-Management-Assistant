/**
 * PaymentSuccess — Dedicated Page for Handling Payment Gateway Redirection Callbacks.
 * Verifies Stripe / Gateway Session ID and confirms MongoDB booking reservation.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { verifyPayment } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useDocumentTitle('Payment Confirmed — StayWise');

  const sessionId = searchParams.get('session_id');
  const homestayId = searchParams.get('homestayId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guestsCount = searchParams.get('guestsCount') || 1;

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const processVerification = async () => {
      if (!homestayId || !checkIn || !checkOut) {
        setError('Missing payment callback parameters.');
        setVerifying(false);
        return;
      }

      try {
        const res = await verifyPayment({
          sessionId,
          homestayId,
          checkIn,
          checkOut,
          guestsCount,
          paymentMethod: 'stripe',
        });

        if (res.success) {
          setBooking(res.data);
        } else {
          setError(res.message || 'Payment verification failed.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    processVerification();
  }, [sessionId, homestayId, checkIn, checkOut, guestsCount]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <h2 className="font-heading font-bold text-lg">Verifying Payment Authorization...</h2>
        <p className="text-xs text-gray-500">Confirming your reservation details with Stripe</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Callback Notice</h2>
        <p className="text-xs text-red-500">{error}</p>
        <Link to="/explore" className="inline-block mt-4 text-xs font-semibold px-5 py-2.5 rounded-xl bg-primary-500 text-white shadow-md">
          Return to Explore
        </Link>
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
          darkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Confetti / Success Icon */}
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-emerald-500">
              Payment Verified & Booking Confirmed! 🎉
            </h1>
            <p className={`text-xs sm:text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your reservation at <strong>{booking?.homestay?.name || 'Homestay'}</strong> is locked in.
            </p>
          </div>

          {/* Receipt Info Card */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 text-left ${
            darkMode ? 'bg-dark-900 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="font-mono font-bold text-primary-500">{booking?.paymentId || 'PAY-SUCCESS'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Amount Paid:</span>
              <span className="font-bold text-emerald-500">₹{booking?.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dates:</span>
              <span>{new Date(booking?.checkIn).toLocaleDateString()} — {new Date(booking?.checkOut).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-xs shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
