import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, ChevronLeft, Map, Home, Car, Navigation,
  Shield, Check, Info, Lock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  
  // Wizard State
  const [step, setStep] = useState(1); // 1: Dates, 2: Logistics, 3: Summary
  
  // Form States
  const [form, setForm] = useState({
    startDate: '', 
    endDate: '', 
    pickupMethod: 'Self Pickup', // "Self Pickup" or "Home Delivery"
    returnMethod: 'Same Location', // "Same Location" or "Different Location"
    pickupLocation: '', 
    dropoffLocation: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [simulatePayment, setSimulatePayment] = useState(true);
  
  // Calculation States
  const [bookingDays, setBookingDays] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Constants
  const HOME_DELIVERY_FEE = 1500;
  const DIFFERENT_LOCATION_FEE = 1000;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
        setVehicle(res.data);
        // Default locations to vehicle's base location
        setForm(prev => ({ 
          ...prev, 
          pickupLocation: res.data.location, 
          dropoffLocation: res.data.location 
        }));
      } catch (err) {
        setError('Failed to load vehicle details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    // Calculate Days
    if (form.startDate && form.endDate && vehicle) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setBookingDays(diffDays);
      
      // Calculate Fees
      let calculatedDeliveryFee = 0;
      if (form.pickupMethod === 'Home Delivery') calculatedDeliveryFee += HOME_DELIVERY_FEE;
      if (form.returnMethod === 'Different Location') calculatedDeliveryFee += DIFFERENT_LOCATION_FEE;
      
      setDeliveryFee(calculatedDeliveryFee);
      // Ensure daily rate is tracked as part of the total
      setTotalPrice((diffDays * vehicle.pricePerDay) + calculatedDeliveryFee);
    } else {
      setBookingDays(0);
      setTotalPrice(0);
      setDeliveryFee(0);
    }
  }, [form.startDate, form.endDate, form.pickupMethod, form.returnMethod, vehicle]);

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'startDate' && prev.endDate && value >= prev.endDate) {
        updated.endDate = '';
      }
      return updated;
    });
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!form.startDate || !form.endDate) {
        setError("Please select valid dates to continue.");
        return;
      }
      
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      
      if (start >= end) {
        setError("End date (Return Date) must be after start date (Pickup Date).");
        return;
      }
      
      const todayVal = new Date();
      todayVal.setHours(0,0,0,0);
      const startMidnight = new Date(start);
      startMidnight.setHours(0,0,0,0);
      if (startMidnight < todayVal) {
        setError("Pickup date cannot be in the past.");
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await axios.post('http://localhost:5000/api/bookings/check-availability', {
          vehicle: id,
          startDate: form.startDate,
          endDate: form.endDate
        });
        
        if (!res.data.available) {
          setError(res.data.msg || "This vehicle is already booked for the selected dates. Please choose another date range.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Availability check failed:", err);
        setError(err.response?.data?.msg || "Failed to verify vehicle availability. Please try again.");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to book a vehicle');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        vehicle: id, 
        ...form, 
        deliveryFee,
        totalPrice,
        paymentMethod,
      };

      const res = await axios.post('http://localhost:5000/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const bookingId = res.data._id;

      if (paymentMethod === 'eSewa') {
        setMsg('Processing secure simulated eSewa payment...');
        
        // Since eSewa's testing sandbox server (rc-epay.esewa.com.np) is currently offline (404),
        // we use the backend's local mock success handler to simulate the transaction.
        const resMock = await axios.post('http://localhost:5000/api/payments/esewa/mock-success', {
          bookingId: bookingId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMsg('Simulated eSewa payment successful! Redirecting...');
        setTimeout(() => navigate(resMock.data.successUrl), 2000);
        return;
      } else {
        setMsg('Booking confirmed! Please pay the owner in cash on pickup. Redirecting...');
        setTimeout(() => navigate('/profile'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Booking failed. Try again.');
      setLoading(false);
    }
  };

  if (loading && !vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body">
        <Navbar variant="dark" />
        <div className="flex items-center justify-center p-32 h-screen">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Very minimal animation variants
  const stepVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-body text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Navbar variant="dark" />

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-32">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Left Side: Wizard Flow */}
          <div className="flex-1 w-full lg:max-w-[700px]">
            <div className="mb-10">
              <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
                <ChevronLeft size={16} className="mr-1" />
                Back to Vehicle
              </button>
              
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 text-slate-900 dark:text-white">
                Complete Booking
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400">Secure your dream drive in just a few steps.</p>
              
              {/* Minimal Step Indicator */}
              <div className="mt-8 flex items-center gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                {[
                  { id: 1, title: 'Duration' },
                  { id: 2, title: 'Logistics' },
                  { id: 3, title: 'Payment' }
                ].map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium flex items-center ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                        {step > s.id ? <Check size={14} className="mr-1.5" /> : <span className="mr-1.5">{s.id}.</span>}
                        {s.title}
                      </span>
                    </div>
                    {idx < 2 && (
                      <span className="text-slate-300 dark:text-slate-700 text-sm">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="relative">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="font-medium text-sm">{error}</p>
                </motion.div>
              )}
              
              <AnimatePresence mode="wait">
                {/* STEP 1: DATES */}
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Select Dates</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                       <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                         <div className="relative">
                           <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <input type="date" name="startDate" value={form.startDate} onChange={onChange} required min={todayStr} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:[color-scheme:dark]" />
                         </div>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date (Return)</label>
                         <div className="relative">
                           <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <input type="date" name="endDate" value={form.endDate} onChange={onChange} required min={form.startDate || todayStr} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:[color-scheme:dark]" />
                         </div>
                       </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button onClick={nextStep} disabled={loading} className="w-full sm:w-auto px-6 h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl transition-colors flex items-center justify-center font-medium text-sm">
                        {loading ? 'Checking Availability...' : 'Continue to Logistics'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: LOGISTICS */}
                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Delivery & Logistics</h3>
                    
                    <div className="space-y-8">
                      {/* Pickup Option */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Receive the car</label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div onClick={() => { setForm({...form, pickupMethod: 'Self Pickup', pickupLocation: vehicle.location}); }} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-start gap-3 ${form.pickupMethod === 'Self Pickup' ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                            <div className="mt-0.5 text-slate-400 dark:text-slate-500"><Car size={20} /></div>
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Self Pickup</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Pick up from {vehicle.location}.</p>
                            </div>
                          </div>
                          
                          <div onClick={() => { setForm({...form, pickupMethod: 'Home Delivery', pickupLocation: ''}); }} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-start gap-3 ${form.pickupMethod === 'Home Delivery' ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                            <div className="mt-0.5 text-slate-400 dark:text-slate-500"><Home size={20} /></div>
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Home Delivery</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Get it delivered to you.</p>
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                + NPR {HOME_DELIVERY_FEE.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dynamic Pickup Input */}
                        <AnimatePresence>
                          {form.pickupMethod === 'Home Delivery' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 overflow-hidden">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Delivery Address</label>
                              <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" name="pickupLocation" value={form.pickupLocation} onChange={onChange} required placeholder="Enter exact address or landmark" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Return Option */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Return the car</label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div onClick={() => { setForm({...form, returnMethod: 'Same Location', dropoffLocation: form.pickupMethod === 'Home Delivery' ? form.pickupLocation : vehicle.location}); }} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-start gap-3 ${form.returnMethod === 'Same Location' ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                            <div className="mt-0.5 text-slate-400 dark:text-slate-500"><Map size={20} /></div>
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Same Location</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Return exactly where picked up.</p>
                            </div>
                          </div>
                          <div onClick={() => { setForm({...form, returnMethod: 'Different Location', dropoffLocation: ''}); }} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-start gap-3 ${form.returnMethod === 'Different Location' ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                            <div className="mt-0.5 text-slate-400 dark:text-slate-500"><Navigation size={20} /></div>
                            <div>
                              <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">Different Location</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">We'll pick it up from you.</p>
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                + NPR {DIFFERENT_LOCATION_FEE.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dynamic Dropoff Input */}
                        <AnimatePresence>
                          {form.returnMethod === 'Different Location' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 overflow-hidden">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Drop-off Address</label>
                              <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" name="dropoffLocation" value={form.dropoffLocation} onChange={onChange} required placeholder="Where will we pick it up?" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center gap-4">
                      <button type="button" onClick={prevStep} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Back</button>
                      <Button onClick={nextStep} className="w-full sm:w-auto px-6 h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl transition-colors flex items-center justify-center font-medium text-sm" disabled={(form.pickupMethod === 'Home Delivery' && !form.pickupLocation) || (form.returnMethod === 'Different Location' && !form.dropoffLocation)}>
                        Review Summary
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PAYMENT / SUMMARY */}
                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Payment Method</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                      <div onClick={() => setPaymentMethod('eSewa')} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-center gap-4 ${paymentMethod === 'eSewa' ? 'border-[#60bb46] bg-[#60bb46]/5 dark:bg-[#60bb46]/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 p-2 flex items-center justify-center shrink-0">
                          <img src="https://esewa.com.np/common/images/esewa-logo.png" alt="eSewa" className="w-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white">eSewa</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Digital Wallet</p>
                        </div>
                      </div>

                      <div onClick={() => setPaymentMethod('Cash')} className={`cursor-pointer p-4 rounded-xl border transition-colors flex items-center gap-4 ${paymentMethod === 'Cash' ? 'border-slate-900 bg-slate-50/50 dark:border-white dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-slate-700'}`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${paymentMethod === 'Cash' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          NPR
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-slate-900 dark:text-white">Cash</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Pay on hand-over</p>
                        </div>
                     </div>
                    </div>

                    {paymentMethod === 'eSewa' && (
                      <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-400">
                          eSewa Sandbox Simulator Active
                        </p>
                        <p className="text-xs text-blue-750 dark:text-slate-350 leading-relaxed">
                          The official eSewa test server (UAT) is currently offline (Tomcat 404). We have activated the local **Sandbox Simulator** so you can complete your booking and verify the payment flow successfully.
                        </p>
                      </div>
                    )}

                    <AnimatePresence>
                      {msg && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 font-medium text-sm mb-6">
                          <CheckCircle2 size={18} /> {msg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-8 flex justify-between items-center gap-4">
                      <button type="button" onClick={prevStep} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Back</button>
                      <Button onClick={handleSubmit} className={`w-full sm:w-auto px-8 h-12 text-sm font-medium rounded-xl transition-colors flex items-center justify-center ${paymentMethod === 'eSewa' ? 'bg-[#60bb46] hover:bg-[#52a13b] text-white' : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white'}`} disabled={loading}>
                        {loading ? 'Processing...' : (paymentMethod === 'eSewa' ? 'Confirm & Simulate Payment' : 'Confirm Booking')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side: Sticky Summary Panel */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-[#111] rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800/60 shadow-sm">
               <h3 className="text-lg font-semibold mb-5 text-slate-900 dark:text-white flex items-center justify-between">
                 Order Summary
               </h3>
               
               {vehicle ? (
                 <div>
                   <div className="relative rounded-xl overflow-hidden mb-5 aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                     {(() => {
                        const imgPath = vehicle.images?.[0]?.url || vehicle.images?.[0] || vehicle.image;
                        return imgPath ? (
                          <img src={`http://localhost:5000${imgPath}`} alt={vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Car size={32} className="opacity-30" />
                          </div>
                        );
                      })()}
                   </div>
                   
                   <div className="mb-6">
                     <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{vehicle.brand} {vehicle.model}</h4>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">{vehicle.location}</p>
                   </div>
                   
                   {/* Itemized Receipt */}
                   <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                         <span>Duration ({bookingDays} {bookingDays === 1 ? 'day' : 'days'})</span>
                         <span className="font-medium text-slate-900 dark:text-white">NPR {(bookingDays * vehicle.pricePerDay).toLocaleString()}</span>
                      </div>
                      
                      <AnimatePresence>
                        {deliveryFee > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                             <span>Logistics Fee</span>
                             <span className="font-medium text-slate-900 dark:text-white">
                               NPR {deliveryFee.toLocaleString()}
                             </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {bookingDays > 0 ? (
                        <div className="flex justify-between items-end pt-5 mt-3 border-t border-slate-100 dark:border-slate-800">
                           <span className="text-sm font-medium text-slate-900 dark:text-white">Total</span>
                           <span className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                             NPR {totalPrice.toLocaleString()}
                           </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500 pt-3">
                           Select dates to calculate total.
                        </div>
                      )}
                   </div>
                 </div>
               ) : (
                 <div className="animate-pulse space-y-5">
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
