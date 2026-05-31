import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, ArrowRight, Star, ShieldCheck, Check, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      
      const token = res.data?.token;
      const user = res.data?.user;

      if (token) localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userEmail", user.email || data.email);
        localStorage.setItem("userRole", user.role || "user");
        localStorage.setItem("isVerifiedOwner", user.isVerifiedOwner || false);
      } else {
        localStorage.setItem("userEmail", data.email);
      }

      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row-reverse bg-white dark:bg-slate-950 font-body">
      
      {/* Right Panel: Form */}
      <div className="w-full lg:w-[55%] xl:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 pb-10">
        
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100/50 dark:bg-primary-900/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-accent/10 dark:bg-accent/5 rounded-full blur-[100px] pointer-events-none opacity-50" />

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
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-500/30 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                G
              </div>
              <span className="text-2xl font-heading font-black tracking-tight text-slate-900 dark:text-white">
                Grand<span className="text-primary-500">Auto</span>
              </span>
            </Link>
            <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Enter your details to securely sign in to your account.</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              icon={Mail}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                icon={Lock}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="flex items-center justify-between mt-4 px-1">
                <div className="flex items-center group cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="peer h-4 w-4 appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:border-primary-500 checked:bg-primary-500 transition-all cursor-pointer"
                    />
                    <Check size={12} strokeWidth={4} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <label htmlFor="remember" className="ml-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 font-bold py-4 rounded-xl mt-6 relative overflow-hidden group" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10 flex items-center justify-center">
                {loading ? "Authenticating..." : "Sign In"} <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </form>

          <p className="mt-10 text-center text-slate-600 dark:text-slate-400 font-medium">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 underline decoration-2 underline-offset-4 transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left Panel: Cover Image */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[55%] relative items-end p-16 overflow-hidden bg-slate-950 rounded-r-[3rem] shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Sports Car" 
            className="w-full h-full object-cover object-center scale-[1.03]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
          <div className="absolute inset-0 bg-primary-900/10 mix-blend-overlay"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 max-w-xl mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Premium Service</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-heading font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
             Experience the thrill of driving absolute luxury.
          </h2>
          

        </motion.div>
      </div>

    </div>
  );
};

export default LoginPage;
