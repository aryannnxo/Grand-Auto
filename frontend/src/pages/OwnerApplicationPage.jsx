import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, CreditCard, ShieldCheck, 
  UploadCloud, FileText, CheckCircle2, AlertCircle, Clock, Camera
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const API = "http://localhost:5000";

const OwnerApplicationPage = () => {
  const [statusInfo, setStatusInfo] = useState({ status: "loading" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "",
    idNumber: "", licenseNumber: "", reason: "",
  });

  const [files, setFiles] = useState({
    ownershipProof: null, idPhoto: null,
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login", { replace: true });

      const res = await axios.get(`${API}/api/owner-applications/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatusInfo(res.data);
      
      // If approved, sync user status to enable owner features immediately
      if (res.data.status === "approved") {
        const userRes = await axios.get(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.setItem("userRole", userRes.data.role);
        localStorage.setItem("isVerifiedOwner", userRes.data.isVerifiedOwner);
        // Refresh page to update Navbar and other components
        if (localStorage.getItem("isVerifiedOwner") !== "true") {
           window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
      setStatusInfo({ status: "none" }); 
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.ownershipProof) fd.append("ownershipProof", files.ownershipProof);
      if (files.idPhoto) fd.append("idPhoto", files.idPhoto);

      await axios.post(`${API}/api/owner-applications/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setMsg("Application submitted successfully! Please wait for admin approval.");
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  if (statusInfo.status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar variant="dark" />
        <div className="flex items-center justify-center p-32">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative overflow-hidden pb-24">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <Navbar variant="dark" />

      <main className="max-w-4xl mx-auto px-6 pt-32 relative z-10">
        
        <div className="text-center mb-12">
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-600 to-accent text-white shadow-xl shadow-primary-500/30 mb-6"
          >
             <ShieldCheck size={40} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 dark:text-white mb-4 tracking-tight">Become an Owner</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            List your premium cars on Grand Auto and start earning. Join our community of trusted vehicle owners today.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 sm:p-12 rounded-[2.5rem] shadow-premium relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-primary-400 via-accent to-primary-500 blur-xl opacity-60"></div>

          {statusInfo.status === "pending" && (
             <div className="flex flex-col items-center justify-center py-12 text-center text-slate-700 dark:text-slate-300">
                <Clock size={64} className="text-amber-500 mb-6" />
                <h2 className="text-2xl font-bold font-heading mb-2">Application Under Review</h2>
                <p className="max-w-md text-slate-500 dark:text-slate-400">
                  Your application to become a verified owner has been received and is currently being reviewed by our team. We'll notify you once the review is complete.
                </p>
             </div>
          )}

          {statusInfo.status === "approved" && (
             <div className="flex flex-col items-center justify-center py-12 text-center text-slate-700 dark:text-slate-300">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black font-heading mb-2">Congratulations!</h2>
                <p className="text-lg text-emerald-600 dark:text-emerald-400 font-bold mb-8">You are a verified owner.</p>
                <Button variant="primary" size="lg" onClick={() => navigate("/add-vehicle")}>Add Your First Vehicle</Button>
             </div>
          )}

          {(statusInfo.status === "none" || statusInfo.status === "rejected") && (
            <>
              {statusInfo.status === "rejected" && (
                 <div className="mb-8 p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-lg">
                     <AlertCircle size={24} /> Application Rejected
                   </div>
                   <p className="text-rose-700 dark:text-rose-300">Reason: {statusInfo.rejectionReason || statusInfo.reason || "Not specified."}</p>
                   <p className="text-rose-600 dark:text-rose-400 font-medium text-sm mt-2">Please correct your information and apply again.</p>
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Personal Details</h3>
                     <Input label="Full Name" name="fullName" value={form.fullName} onChange={onChange} icon={User} required placeholder="John Doe" />
                     <Input label="Email Address" type="email" name="email" value={form.email} onChange={onChange} icon={Mail} required placeholder="you@example.com" />
                     <Input label="Phone Number" name="phone" value={form.phone} onChange={onChange} icon={Phone} required placeholder="+977 98..." />
                     <Input label="Address" name="address" value={form.address} onChange={onChange} icon={MapPin} required placeholder="City, Street" />
                   </div>

                   <div className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Verification Documents</h3>
                     <Input label="Citizenship / ID Number" name="idNumber" value={form.idNumber} onChange={onChange} icon={CreditCard} required placeholder="XX-XX-XXXX" />
                     <Input label="Driver's License Number" name="licenseNumber" value={form.licenseNumber} onChange={onChange} icon={CreditCard} required placeholder="XX-XXXX" />
                     
                     <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Ownership Proof (Image/PDF)</label>
                       <label className="flex items-center justify-center w-full h-14 px-4 transition bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-slate-500">
                         <span className="flex items-center space-x-2">
                           <UploadCloud size={20} className="text-primary-500" />
                           <span className="font-medium">{files.ownershipProof ? files.ownershipProof.name : "Click to upload proof"}</span>
                         </span>
                         <input type="file" name="ownershipProof" accept="image/*,.pdf" className="hidden" onChange={onFileChange} required />
                       </label>
                     </div>

                     <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">ID Photo (Selfie with ID)</label>
                       <label className="flex items-center justify-center w-full h-14 px-4 transition bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-slate-500">
                         <span className="flex items-center space-x-2">
                           <Camera size={20} className="text-primary-500" />
                           <span className="font-medium">{files.idPhoto ? files.idPhoto.name : "Click to upload selfie"}</span>
                         </span>
                         <input type="file" name="idPhoto" accept="image/*" className="hidden" onChange={onFileChange} required />
                       </label>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <label className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300"><FileText size={16} className="mr-2 text-primary-500" /> Why do you want to join as an owner?</label>
                   <textarea
                     name="reason" value={form.reason} onChange={onChange} rows={4}
                     className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                     placeholder="Tell us a little bit about yourself and your vehicles..."
                   />
                 </div>

                 {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
                 {msg && <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 size={18} /> {msg}</div>}

                 <div className="pt-6">
                    <Button type="submit" variant="primary" size="lg" className="w-full h-14 text-lg shadow-primary-500/30" disabled={loading}>
                      {loading ? "Submitting Application..." : "Submit Application"}
                    </Button>
                 </div>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OwnerApplicationPage;
