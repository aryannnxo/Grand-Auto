import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/Button';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error') || 'unknown';

  const getErrorMessage = () => {
    switch (error) {
      case 'user_cancelled': return "You cancelled the transaction before completing the payment.";
      case 'invalid_signature': return "We couldn't verify the secure signature from eSewa. Please try again.";
      case 'payment_failed': return "eSewa reported that the payment failed. Please check your balance or try again.";
      default: return "An unknown error occurred while processing your payment.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body flex flex-col">
      <Navbar variant="dark" />
      
      <main className="flex-1 flex items-center justify-center p-6 pt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 md:p-12 shadow-premium border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-500/10 to-transparent"></div>
          
          <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
             <XCircle size={48} className="text-rose-500 relative z-10" />
          </div>

          <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-2">Payment Failed</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
            {getErrorMessage()}
          </p>

          <div className="p-4 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 text-sm font-bold flex items-center justify-center gap-2 mb-8">
             <AlertTriangle size={18} /> No funds were deducted from your account.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="w-full sm:w-auto text-slate-700 dark:text-slate-300" onClick={() => navigate('/profile')}>
               Go to Dashboard
            </Button>
            <Button variant="primary" className="w-full sm:w-auto shadow-rose-500/30 bg-rose-500 hover:bg-rose-600" onClick={() => navigate(-1)}>
               <RefreshCw size={18} className="mr-2" /> Try Again
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentFailurePage;
