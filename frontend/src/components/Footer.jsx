import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Smartphone, 
  ShieldCheck, 
  Star, 
  Award,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  HelpCircle,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Send
} from "lucide-react";

// Reusable Footer Link Component
const FooterLink = ({ to, children }) => (
  <li>
    <Link 
      to={to} 
      className="text-slate-400 hover:text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary-400 hover:to-blue-400 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center group text-[13px] font-medium"
    >
      <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2 text-primary-500" />
      {children}
    </Link>
  </li>
);

const AppStoreButton = ({ store }) => (
  <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition-all group w-full sm:w-auto">
    {store === 'apple' ? (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.14-.02-1.5-.72-2.82-.72-1.32 0-1.74.7-2.82.74-1.14.04-2.2-.82-3.19-1.78-2.02-1.95-3.56-5.5-3.56-8.82 0-3.32 2.1-5.07 4.1-5.07 1.15 0 2.22.75 2.82.75.6 0 1.9-.9 3.25-.76 1.45.15 2.6.9 3.2 1.95-2.9 1.7-2.45 5.5.4 6.7-.6 1.55-1.4 3.1-2.4 4.15zM12.03 7.25c-.02-2.23 1.84-4.22 4.02-4.22.25 2.7-2.1 4.5-4.02 4.22z"/>
      </svg>
    ) : (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM14.4 12.71L17.04 15.35L5.05 22.21L14.4 12.71ZM14.4 11.29L5.05 1.79004L17.04 8.65004L14.4 11.29ZM15.11 12L18.06 9.05L21.43 11C21.78 11.2 22 11.58 22 12C22 12.42 21.78 12.8 21.43 13L18.06 14.95L15.11 12Z"/>
      </svg>
    )}
    <div className="text-left">
      <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Download on</p>
      <p className="text-sm font-black text-white leading-tight">{store === 'apple' ? 'App Store' : 'Google Play'}</p>
    </div>
  </button>
);

const Footer = () => {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");

  const footerData = [
    {
      title: "More Information",
      links: [
        { label: "Contact Us", to: "/help" },
        { label: "Mobile App", to: "/mobile" },
        { label: "Find a rental location", to: "/listings" },
        { label: "Accessibility", to: "/accessibility" }
      ]
    },
    {
      title: "Business",
      links: [
        { label: "Business solutions", to: "/business" },
        { label: "Tour operators", to: "/partners" },
        { label: "Travel agents", to: "/agents" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "Careers", to: "/careers" },
        { label: "Partner brands", to: "/brands" },
        { label: "On-demand rentals", to: "/rentals" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms & Conditions", to: "/terms" },
        { label: "Deposit Policy", to: "/deposit" },
        { label: "Damage Policy", to: "/damage" }
      ]
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#03060d] text-slate-300 relative overflow-hidden pt-20">
      {/* Subtle Animated Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.1, 1] }} 
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary-600 blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.08, 0.05], scale: [1, 1.2, 1] }} 
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* 1. Top Section (Cards – 3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          
          {/* Card 1 – Booking */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl group transition-all duration-500 hover:border-primary-500/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">About your booking</h3>
            <div className="space-y-3">
              <Link to={isLoggedIn ? "/profile" : "/login"} className="flex items-center justify-between text-slate-400 hover:text-white transition-colors group/item leading-tight">
                <span className="text-sm font-bold">View / modify / cancel booking</span>
                <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all text-primary-500" />
              </Link>
              <Link to={isLoggedIn ? "/profile" : "/login"} className="flex items-center justify-between text-slate-400 hover:text-white transition-colors group/item leading-tight">
                <span className="text-sm font-bold">Manage your booking</span>
                <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all text-primary-500" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2 – Offers */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl group transition-all duration-500 hover:border-blue-500/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Exclusive offers</h3>
            <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">Sign up to receive our latest luxury offers and member-only rewards.</p>
            <form onSubmit={handleSubscribe} className="relative overflow-hidden rounded-xl">
               <AnimatePresence mode="wait">
                 {!subscribed ? (
                   <motion.div 
                     key="button"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="flex gap-2"
                   >
                     <input 
                        type="email" required placeholder="your@email.com" 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 transition-all text-xs font-bold w-full"
                     />
                     <button type="submit" className="flex items-center justify-center bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl px-4 h-11 hover:shadow-[0_0_20px_rgba(75,107,251,0.4)] transition-all transform active:scale-95 shrink-0">
                       <ArrowRight size={18} />
                     </button>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="success"
                     initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                     className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest py-3"
                   >
                     <CheckCircle2 size={16} /> Welcome to the club!
                   </motion.div>
                 )}
               </AnimatePresence>
            </form>
          </motion.div>

          {/* Card 3 – Mobile App */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl group transition-all duration-500 hover:border-emerald-500/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Smartphone size={24} />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Smart mobility. Anytime.</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <AppStoreButton store="google" />
              <AppStoreButton store="apple" />
            </div>
          </motion.div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16 px-6"></div>

        {/* 2. Main Footer Links (Mapped Data) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20 px-4">
          {footerData.map((section, idx) => (
             <div key={idx} className="space-y-6">
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <FooterLink key={j} to={link.to}>{link.label}</FooterLink>
                  ))}
                </ul>
             </div>
          ))}
        </div>

        {/* 3. Trust & Awards Section */}
        <div className="py-12 border-t border-white/5 flex flex-wrap items-center justify-center gap-12 lg:gap-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <Star fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase leading-none mb-1">4.9/5 Rating</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customer Reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-[0_0_15px_rgba(75,107,251,0.1)]">
              <Award size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase leading-none mb-1">Best Car Rental</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">World Travel Awards 2025</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase leading-none mb-1">Premium Safety</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cleanliness Badge</p>
            </div>
          </div>
        </div>

        {/* 4. Bottom Bar */}
        <div className="pt-10 pb-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
          <div className="flex items-center gap-6">
            <Link to="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                  <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5c2.3 0 4.4.9 6 2.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M12 12h8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-tighter">GRAND AUTO</span>
            </Link>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] pt-1">
              &copy; {new Date().getFullYear()} Grand Auto Technologies.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex gap-4">
              {socials.map((social, i) => (
                <a key={i} href={social.href} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-6 pl-6 border-l border-white/10 hidden sm:flex">
                {['Sitemap', 'Legal', 'Cookies', 'Contact'].map(item => (
                  <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

const socials = [
  { icon: Linkedin, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" }
];

export default Footer;
