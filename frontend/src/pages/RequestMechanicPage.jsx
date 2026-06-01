import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Wrench, AlertTriangle, Car, ClipboardCheck, MapPin,
  CalendarDays, FileText, ChevronLeft, CheckCircle2,
  Shield, Lock, Clock, Navigation, Check, Battery,
  Wind, Droplet, Star, Phone, Camera, ArrowRight, Home, User
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const SERVICE_TYPES = [
  { id: "Accident / Damage", icon: AlertTriangle, label: "Accident / Damage", desc: "Collision or body damage", price: 5000, time: "Urgent" },
  { id: "Engine Issue", icon: Wrench, label: "Engine Issue", desc: "Diagnostic & mechanical fix", price: 3000, time: "2-4 hrs" },
  { id: "Flat Tyre", icon: Car, label: "Flat Tyre", desc: "Patch or replace", price: 1000, time: "30 mins" },
  { id: "Battery Problem", icon: Battery, label: "Battery Problem", desc: "Jumpstart or replace", price: 800, time: "20 mins" },
  { id: "Brake Problem", icon: Car, label: "Brake Problem", desc: "Brake pads or fluid", price: 2500, time: "45 mins" },
  { id: "Roadside Assistance", icon: Navigation, label: "Roadside Assistance", desc: "Towing or general help", price: 2000, time: "1 hr" },
  { id: "General Service", icon: ClipboardCheck, label: "General Service", desc: "Oil change and inspection", price: 1500, time: "1 hr" },
  { id: "Other", icon: Home, label: "Other", desc: "Miscellaneous issues", price: 2000, time: "Flexible" }
];

const RequestMechanicPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vehicleId = searchParams.get("vehicleId");
  const bookingId = searchParams.get("bookingId");
  const source = searchParams.get("source"); // customer or seller

  const [step, setStep] = useState(1);

  // Prevent mechanics from accessing the request page
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "mechanic") {
      navigate("/mechanic/dashboard");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    serviceType: "",
    vehicleModel: "",
    location: "",
    city: "",
    requestedDate: "",
    requestedTime: "",
    description: "",
    isEmergency: false,
    uploadedPhotos: false,
    contactName: "",
    contactPhone: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.serviceType) {
      setError("Please select a service type to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.serviceType || !formData.location || !formData.city || !formData.requestedDate || !formData.requestedTime || !formData.description || !formData.contactName || !formData.contactPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const dateTime = new Date(`${formData.requestedDate}T${formData.requestedTime}`);

      const finalDescription = `
Vehicle Model: ${formData.vehicleModel || 'Not provided'}
Emergency Status: ${formData.isEmergency ? 'YES - High Priority' : 'Normal'}
Photos Uploaded: ${formData.uploadedPhotos ? 'Yes' : 'No'}

Issue Details:
${formData.description}
      `.trim();

      const payload = {
        vehicleId: vehicleId,
        bookingId: bookingId,
        issueType: formData.serviceType,
        problemDescription: finalDescription,
        location: `${formData.location}, ${formData.city}`,
        isEmergency: formData.isEmergency,
        contactPhone: formData.contactPhone
      };

      const endpoint = source === "seller" ? `${API}/api/mechanics/seller` : `${API}/api/mechanics`;

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => navigate(source === "seller" ? "/seller/bookings" : "/profile"), 3500);

    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getActiveService = () => SERVICE_TYPES.find(s => s.id === formData.serviceType);

  const calculateTotal = () => {
    const service = getActiveService();
    if (!service) return 0;
    let base = service.price;
    const travelFee = 500;
    const emergencyFee = formData.isEmergency ? 1500 : 0;
    const tax = (base + travelFee + emergencyFee) * 0.13;
    return base + travelFee + emergencyFee + tax;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-body flex items-center justify-center">
        <Navbar variant="dark" />
        <div className="px-6 w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } }} className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-8 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}>
            <h2 className="text-3xl font-black font-heading text-slate-900 dark:text-white mb-4 tracking-tight">Mechanic Dispatched</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
              Your premium service request has been confirmed. A certified expert is reviewing your details and will arrive shortly.
            </p>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "linear" }} className="h-full bg-slate-900 dark:bg-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Redirecting to Dashboard</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const stepVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] font-body relative overflow-x-hidden text-slate-900 dark:text-slate-100 pb-24">
      {/* Subtle Luxury Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <Navbar variant="dark" />

      <main className="max-w-[1300px] mx-auto px-4 md:px-8 pt-12 relative z-10 flex flex-col lg:flex-row gap-10 xl:gap-16">

        {/* Left Side: Booking Flow */}
        <div className="flex-1 w-full lg:max-w-[750px]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <button onClick={() => navigate(-1)} className="group flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center mr-3 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                <ChevronLeft size={16} />
              </div>
              Back
            </button>

            <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-slate-900 dark:text-white">
              Book a <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Mechanic</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">Professional roadside assistance and premium vehicle servicing.</p>

            {/* Minimal Animated Step Indicator */}
            <div className="mt-10 flex items-center gap-4">
              {[
                { id: 1, title: 'Service' },
                { id: 2, title: 'Schedule' },
                { id: 3, title: 'Confirm' }
              ].map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold flex items-center transition-colors duration-300 ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                      {step > s.id ? <Check size={14} className="mr-1.5 text-blue-600 dark:text-blue-400" /> : <span className="mr-1.5">{s.id}.</span>}
                      {s.title}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 mx-1 max-w-[40px]">
                      <div className={`h-full bg-blue-600 dark:bg-blue-400 transition-all duration-700 ease-in-out ${step > s.id ? 'w-full' : 'w-0'}`} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="font-medium text-sm">{error}</p>
            </motion.div>
          )}

          <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] border border-slate-200/50 dark:border-white/5 relative">
            <AnimatePresence mode="wait">
              {/* STEP 1: SERVICE SELECTION */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-6">Select Service</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICE_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setFormData({ ...formData, serviceType: type.id })}
                        className={`group cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 relative overflow-hidden ${formData.serviceType === type.id
                            ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                          }`}
                      >
                        {formData.serviceType === type.id && <div className="absolute top-4 right-4 text-blue-600 dark:text-blue-400"><CheckCircle2 size={20} /></div>}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.serviceType === type.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                          <type.icon size={22} strokeWidth={2} />
                        </div>
                        <h4 className={`font-bold text-lg mb-1 ${formData.serviceType === type.id ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-white'}`}>
                          {type.label}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{type.desc}</p>
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={14} /> {type.time}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span>Est. NPR {type.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 flex justify-end">
                    <Button onClick={handleNextStep} className="w-full sm:w-auto px-8 h-14 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl transition-all shadow-xl shadow-slate-900/10 font-bold text-base group">
                      Continue <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SCHEDULE & DETAILS */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">Service Details</h3>

                  {/* Emergency Toggle */}
                  <div className={`p-5 rounded-2xl border-2 transition-colors flex items-center justify-between cursor-pointer ${formData.isEmergency ? 'border-red-500 bg-red-50 dark:bg-red-900/10 shadow-lg shadow-red-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, isEmergency: !formData.isEmergency })}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.isEmergency ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${formData.isEmergency ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>Emergency Service</h4>
                        <p className="text-sm text-slate-500">Prioritize request (Surcharge applies)</p>
                      </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.isEmergency ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.isEmergency ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Vehicle Model (Optional)</label>
                      <div className="relative">
                        <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Porsche 911" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Full address or GPS" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City name" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="date" name="requestedDate" value={formData.requestedDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400 dark:[color-scheme:dark]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="time" name="requestedTime" value={formData.requestedTime} onChange={handleChange} required className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400 dark:[color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Contact Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required placeholder="Your full name" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required placeholder="Your phone number" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-[11px]">Issue Description</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea name="description" rows={4} value={formData.description} onChange={handleChange} required placeholder="Please describe the issue in detail..." className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all text-sm font-medium placeholder-slate-400 resize-none" />
                    </div>
                  </div>

                  {/* Mock Photo Upload */}
                  <div onClick={() => setFormData({ ...formData, uploadedPhotos: !formData.uploadedPhotos })} className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${formData.uploadedPhotos ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${formData.uploadedPhotos ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {formData.uploadedPhotos ? <CheckCircle2 size={24} /> : <Camera size={24} />}
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{formData.uploadedPhotos ? 'Photos Uploaded Successfully' : 'Upload Issue Photos'}</p>
                    <p className="text-xs text-slate-500">Helps our mechanic prepare the right tools.</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors">Back</button>
                    <Button onClick={handleSubmit} className="w-full sm:w-auto px-8 h-14 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl transition-all shadow-xl shadow-slate-900/10 font-bold text-base" disabled={loading}>
                      {loading ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Premium Summary Panel */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-32 mb-10">
          <div className="bg-white/90 dark:bg-[#111111]/90 backdrop-blur-2xl rounded-[2rem] p-6 lg:p-8 border border-slate-200/50 dark:border-slate-800/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden">

            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

            <h3 className="text-lg font-bold font-heading mb-6 text-slate-900 dark:text-white flex items-center justify-between uppercase tracking-wider text-[13px]">
              Service Overview
            </h3>

            {/* Assigned Mechanic Preview (Mock) */}
            <div className="bg-slate-50 dark:bg-[#161616] rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-xl uppercase tracking-widest">
                <Shield size={10} /> Certified
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-[#161616] shadow-sm">
                  <img src="https://i.pravatar.cc/150?u=mechanic" alt="Mechanic" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Searching Local Hub...</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Matching premium expert</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs font-bold text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-slate-400 ml-1 font-medium">(Top Rated)</span>
                  </div>
                </div>
              </div>
            </div>

            {formData.serviceType ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{getActiveService()?.label}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{getActiveService()?.desc}</p>
                </div>

                {/* Itemized Estimate */}
                <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>Service Fee</span>
                    <span className="text-slate-900 dark:text-white">NPR {getActiveService()?.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>Travel Fee</span>
                    <span className="text-slate-900 dark:text-white">NPR 500</span>
                  </div>
                  <AnimatePresence>
                    {formData.isEmergency && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-between items-center text-sm font-bold text-red-600 dark:text-red-400">
                        <span>Emergency Surcharge</span>
                        <span>NPR 1,500</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-1">
                    <span>Tax (13%)</span>
                    <span>NPR {Math.round((getActiveService()?.price + 500 + (formData.isEmergency ? 1500 : 0)) * 0.13).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-end pt-5 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Est. Total</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                      NPR {Math.round(calculateTotal()).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Wrench size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-400">Select a service to see<br />estimated costs.</p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-y-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Clock className="text-blue-500" size={16} /> 24/7 Support
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Shield className="text-emerald-500" size={16} /> Verified Experts
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Navigation className="text-blue-500" size={16} /> Live Tracking
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <Lock className="text-emerald-500" size={16} /> Secure Payment
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestMechanicPage;
