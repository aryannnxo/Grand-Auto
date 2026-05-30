import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Download, CalendarCheck, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/Button';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking');
  const transactionId = searchParams.get('tx');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body flex flex-col">
      <Navbar variant="dark" />
      
      <main className="flex-1 flex items-center justify-center p-6 pt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 md:p-12 shadow-premium border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
        >
          {/* Confetti Background decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>
          
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
             <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
             <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
          </div>

          <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            Your eSewa payment was successfully processed. Your booking is now confirmed.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left mb-8 space-y-4">
             <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="font-bold text-slate-500">Booking ID</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{bookingId ? bookingId.slice(-8) : 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="font-bold text-slate-500">Transaction Ref</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{transactionId || 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500">Payment Status</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold rounded-full text-xs uppercase tracking-wider">
                  Verified Paid
                </span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="w-full sm:w-auto text-slate-600" onClick={() => window.print()}>
               <Download size={18} className="mr-2" /> Receipt
            </Button>
            <Button variant="primary" className="w-full sm:w-auto shadow-emerald-500/30 bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate('/profile')}>
               <CalendarCheck size={18} className="mr-2" /> View Dashboard
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-center">
             <ShieldCheck size={14} className="mr-1 text-emerald-500" /> SECURE ESEWA TRANSACTION
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
