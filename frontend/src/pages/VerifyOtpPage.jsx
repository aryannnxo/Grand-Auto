import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, KeyRound, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
        <div className="glass-panel p-12 rounded-[2.5rem] shadow-premium text-center max-w-md w-full">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white mb-2">Session expired</h2>
          <p className="text-slate-500 mb-8">Your verification session has expired or is invalid. Please sign up again.</p>
          <Button variant="primary" className="w-full" onClick={() => navigate("/signup")}>Go to Signup</Button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register/verify-otp", { email, otp });
      const token = res.data?.token;
      const user = res.data?.user;
      
      if (token) localStorage.setItem("token", token);
      
      if (user) {
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userEmail", user.email || email);
        localStorage.setItem("userRole", user.role || "user");
        localStorage.setItem("isVerifiedOwner", user.isVerifiedOwner || false);
      } else {
        localStorage.setItem("userEmail", email);
      }
      
      if (token) {
        if (user?.role === "admin") navigate("/admin/verification");
        else navigate("/");
      } else {
        setError("No token received. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError(""); setResending(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register/request-otp", {
        name: state?.name || "User", email, password: state?.password || "temp",
      });
      alert("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.msg || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-body relative overflow-hidden py-12 px-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10 glass-panel p-8 sm:p-12 rounded-[2.5rem] shadow-premium relative my-8"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-primary-400 via-primary-500 to-accent blur-xl opacity-60"></div>
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">G</div>
            <span className="text-2xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">Grand<span className="text-primary-500">Auto</span></span>
          </Link>
          <h1 className="text-3xl font-heading font-black text-slate-800 dark:text-white mb-2 tracking-tight">Verify your email</h1>
          <p className="text-slate-500 dark:text-slate-400">Enter the 6-digit code sent to <br/><b className="text-slate-800 dark:text-slate-200">{email}</b></p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" /><p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <Input id="otp" name="otp" type="text" label="Verification Code" icon={KeyRound} placeholder="123456" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-2xl tracking-[0.5em] font-bold py-4" />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" className="w-full text-lg shadow-primary-500/30 font-bold" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create Account"} <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
          Didn't receive a code?{" "}
          <button type="button" onClick={resendOtp} disabled={resending} className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors inline-flex items-center gap-1">
            <RefreshCw size={14} className={resending ? "animate-spin" : ""} /> {resending ? "Sending..." : "Resend OTP"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
