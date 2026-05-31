import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, ChevronLeft, Car,
  Calendar, MapPin, CreditCard, Banknote, Info,
  Loader2, ShieldCheck, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';

const API = 'http://localhost:5000';

const BookingPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const res = await axios.get(`${API}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Redirect away if the booking isn't in the right state
        if (res.data.status !== 'approved-awaiting-payment') {
          navigate('/profile');
          return;
        }

        setBooking(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Booking not found or not accessible.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handlePay = async () => {
    if (processing) return;
    setError('');
    setSuccess('');
    setProcessing(true);

    const token = localStorage.getItem('token');

    try {
      if (paymentMethod === 'Cash') {
        // ── Cash: confirm cash → status: confirmed-awaiting-cash-payment ──
        await axios.put(
          `${API}/api/bookings/${bookingId}/select-cash`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Cash payment confirmed! Please pay the owner on pickup. Redirecting...');
        setTimeout(() => navigate('/profile'), 2500);

      } else {
        // ── eSewa: call initiate → get signed params → POST form to eSewa sandbox ──
        setSuccess('Preparing eSewa payment...');

        const res = await axios.post(
          `${API}/api/payments/esewa/initiate`,
          { bookingId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const params = res.data;

        // Build a hidden form and submit it to the eSewa test sandbox
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

        const fields = {
          amount:                   params.amount,
          tax_amount:               params.tax_amount,
          total_amount:             params.total_amount,
          transaction_uuid:         params.transaction_uuid,
          product_code:             params.product_code,
          product_service_charge:   params.product_service_charge,
          product_delivery_charge:  params.product_delivery_charge,
          success_url:              params.success_url,
          failure_url:              params.failure_url,
          signed_field_names:       params.signed_field_names,
          signature:                params.signature,
        };

        Object.entries(fields).forEach(([name, value]) => {
          const input = document.createElement('input');
          input.type  = 'hidden';
          input.name  = name;
          input.value = value ?? '';
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit(); // Opens eSewa test payment page
      }
    } catch (err) {
      setSuccess('');
      setError(err.response?.data?.msg || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  /* ── helpers ── */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const getDays = (start, end) => {
    const diff = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body">
        <Navbar variant="dark" />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body">
        <Navbar variant="dark" />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const days = booking ? getDays(booking.startDate, booking.endDate) : 0;
  const vehicleImg = booking?.vehicle?.images?.[0]?.url || booking?.vehicle?.images?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-body text-slate-900 dark:text-slate-100">
      <Navbar variant="dark" />

      <main className="max-w-[1100px] mx-auto px-4 md:px-8 pt-24 pb-32">
        {/* Back */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Profile
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Left: Payment Form ── */}
          <div className="flex-1 w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-4">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Booking Approved</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-slate-900 dark:text-white">
                Complete Payment
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your booking is approved. Choose how you'd like to pay.
              </p>
            </div>

            {/* Errors / Success */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <p className="font-medium text-sm">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 size={17} className="shrink-0" />
                  <p className="font-medium text-sm">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payment Method Selection */}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Select Payment Method
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* Cash */}
              <div
                onClick={() => setPaymentMethod('Cash')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                  paymentMethod === 'Cash'
                    ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/60 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                  paymentMethod === 'Cash'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  <Banknote size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Cash Payment</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pay the owner directly in cash when you pick up the vehicle.
                  </p>
                  {paymentMethod === 'Cash' && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Selected
                    </span>
                  )}
                </div>
              </div>

              {/* eSewa */}
              <div
                onClick={() => setPaymentMethod('eSewa')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                  paymentMethod === 'eSewa'
                    ? 'border-[#60bb46] bg-[#60bb46]/5 dark:bg-[#60bb46]/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-center shrink-0">
                  <img
                    src="https://esewa.com.np/common/images/esewa-logo.png"
                    alt="eSewa"
                    className="w-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">eSewa</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pay instantly with your eSewa digital wallet.
                  </p>
                  {paymentMethod === 'eSewa' && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-[#60bb46] bg-[#60bb46]/10 border border-[#60bb46]/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
              <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                {paymentMethod === 'Cash'
                  ? 'Your booking will be marked as confirmed. Pay the owner the full amount in cash when you pick up the vehicle.'
                  : 'eSewa sandbox is currently active. Your payment will be processed using the simulator.'}
              </p>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={processing || !!success}
              className={`w-full h-14 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 ${
                paymentMethod === 'eSewa'
                  ? 'bg-[#60bb46] hover:bg-[#52a13b] text-white'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white'
              }`}
            >
              {processing ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : success ? (
                <><CheckCircle2 size={18} /> Done!</>
              ) : (
                <>
                  {paymentMethod === 'eSewa'
                    ? <><CreditCard size={18} /> Pay Rs. {booking?.totalPrice?.toLocaleString()} with eSewa</>
                    : <><Banknote size={18} /> Confirm Cash Payment — Rs. {booking?.totalPrice?.toLocaleString()}</>
                  }
                </>
              )}
            </button>
          </div>

          {/* ── Right: Booking Summary Card ── */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-slate-200 dark:border-slate-800/60 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
                Booking Summary
              </h3>

              {/* Vehicle image */}
              <div className="rounded-xl overflow-hidden mb-5 aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                {vehicleImg ? (
                  <img
                    src={`${API}${vehicleImg}`}
                    alt={booking?.vehicle?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Car size={36} />
                  </div>
                )}
              </div>

              {/* Vehicle name */}
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {booking?.vehicle?.brand} {booking?.vehicle?.model}
              </h4>
              <p className="text-slate-500 text-xs mb-5">{booking?.vehicle?.location}</p>

              {/* Details */}
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar size={15} className="text-slate-400 shrink-0" />
                  <span>
                    {formatDate(booking?.startDate)} → {formatDate(booking?.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={15} className="text-slate-400 shrink-0" />
                  <span>{booking?.pickupLocation}</span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{days} {days === 1 ? 'day' : 'days'} × Rs. {booking?.vehicle?.pricePerDay?.toLocaleString()}</span>
                    <span className="font-medium text-slate-800 dark:text-white">
                      Rs. {(days * (booking?.vehicle?.pricePerDay || 0)).toLocaleString()}
                    </span>
                  </div>
                  {booking?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Logistics Fee</span>
                      <span className="font-medium text-slate-800 dark:text-white">
                        Rs. {booking?.deliveryFee?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">Total</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      Rs. {booking?.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Owner approved — ready for payment
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BookingPaymentPage;
