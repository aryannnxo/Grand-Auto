import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const SignupPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register/request-otp", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      navigate("/verify-otp", {
        state: { email: data.email, name: data.name },
      });
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-body">
      
      {/* Left Panel: Cover Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[55%] relative items-center justify-center p-16 overflow-hidden bg-slate-950 rounded-r-[3rem] shadow-[20px_0_40px_rgba(0,0,0,0.05)] z-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Car Interior" 
            className="w-full h-full object-cover object-center scale-[1.03]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/90"></div>
          <div className="absolute inset-0 bg-primary-900/20 mix-blend-overlay"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-xl">
            <ShieldCheck size={16} className="text-primary-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Join The Fleet</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-heading font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
             Your journey starts here. Drive the extraordinary.
          </h2>
          <p className="text-slate-300 font-medium text-lg mb-10 leading-relaxed max-w-md">
            Create an account to unlock access to our exclusive collection of premium vehicles, manage your bookings, and enjoy a seamless rental experience.
          </p>

          <div className="space-y-5">
            {[
              "Access to 100+ premium and luxury vehicles",
              "Instant booking and seamless digital payments",
              "24/7 dedicated customer support and roadside assistance"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shrink-0 shadow-sm">
                  <CheckCircle2 size={16} className="text-primary-400" />
                </div>
                <p className="text-slate-200 font-medium drop-shadow-sm">{feature}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-[55%] xl:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 py-12">
        
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/50 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none opacity-40" />
        <div className="absolute bottom-0 right-[-10%] w-[300px] h-[300px] bg-primary-500/10 dark:bg-primary-900/10 rounded-full blur-[100px] pointer-events-none opacity-40" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md mx-auto relative z-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow mb-6"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back
          </button>

          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                G
              </div>
              <span className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-white">
                Grand<span className="text-primary-500">Auto</span>
              </span>
            </Link>
            <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white mb-3 tracking-tight">Create an account</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Sign up to book cars, manage trips, and save favourites.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 flex items-start gap-3 shadow-sm"
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              icon={User}
              placeholder="e.g. John Doe"
              required
              autoComplete="name"
              className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 focus:bg-white focus:ring-primary-500/20 pt-3 pb-3"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              icon={Mail}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 focus:bg-white focus:ring-primary-500/20 pt-3 pb-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                icon={Lock}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 focus:bg-white focus:ring-primary-500/20 pt-3 pb-3"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                icon={Lock}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 focus:bg-white focus:ring-primary-500/20 pt-3 pb-3"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 font-bold py-4 rounded-xl mt-6 relative overflow-hidden group" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10 flex items-center justify-center">
                {loading ? "Sending OTP..." : "Create Account"} <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </form>

          <p className="mt-10 text-center text-slate-600 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 underline decoration-2 underline-offset-4 transition-colors">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default SignupPage;
