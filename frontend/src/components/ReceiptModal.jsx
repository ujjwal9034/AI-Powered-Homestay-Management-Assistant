/**
 * ReceiptModal — Itemized Payment Invoice Viewer & Printer.
 * Displays official booking receipt, payment authorization code, and price breakdowns.
 */

import { useTheme } from '../context/ThemeContext';
import { X, Printer, ShieldCheck, CheckCircle2, MapPin, Calendar, User, Receipt } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  const { darkMode } = useTheme();

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-dark-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700/80 bg-gradient-to-r from-emerald-500/10 via-transparent to-primary-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg">Official Payment Receipt</h2>
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Confirmed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-900/50 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Receipt No</span>
              <span className="font-mono font-bold">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Transaction ID</span>
              <span className="font-mono font-bold text-primary-500">{receipt.paymentId}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Payment Method</span>
              <span className="font-semibold capitalize">{receipt.paymentMethod || 'Credit Card'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">Paid Timestamp</span>
              <span className="font-semibold">{new Date(receipt.paidAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Guest & Homestay Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Reservation Summary</h4>
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Property:</span>
                <span className="font-bold text-gray-900 dark:text-white">{receipt.homestay?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span>{receipt.homestay?.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Guest:</span>
                <span>{receipt.customer?.name} ({receipt.customer?.email})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Check-In / Out:</span>
                <span>{new Date(receipt.dates?.checkIn).toLocaleDateString()} — {new Date(receipt.dates?.checkOut).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Price Breakdown</h4>
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Base Accommodation ({receipt.breakdown?.nights} night{receipt.breakdown?.nights > 1 ? 's' : ''})</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{receipt.breakdown?.basePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>StayWise Service Fee (5%)</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{receipt.breakdown?.serviceFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Occupancy Taxes (12%)</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{receipt.breakdown?.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold">
                <span>Total Amount Paid</span>
                <span className="text-emerald-500">₹{receipt.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Thank you for choosing StayWise! Need help? Contact support@staywise.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
