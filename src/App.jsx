import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { 
  ShoppingCart, ArrowLeft, Star, Leaf, Flame, Zap, 
  ChevronRight, ArrowUpRight, Award, Eye, Send, MapPin, Phone, Clock, 
  ShieldCheck, Sparkles, Instagram, Facebook, Twitter, Users, History, 
  Linkedin, Mail, Smile, Lock, HeartHandshake, Check, Quote, Heart, 
  Menu as MenuIcon, X, Search, ChevronDown, Filter, HelpCircle, ThumbsUp
} from 'lucide-react';
import { supabase } from './lib/supabase';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

// ==========================================
// 1. SYSTEM UTILITIES & CONFIGURATION
// ==========================================

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

const formatCurrency = (value) => {
  const num = parseInt(value?.toString().replace(/[^0-9]/g, '') || 0);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// --- ANIMATION VARIANTS (High Quality) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 50, damping: 20, mass: 1 } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, opacity: 1, 
    transition: { type: "spring", duration: 0.8, bounce: 0.3 } 
  }
};

const slideInLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 60 } }
};

const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 60 } }
};

// ==========================================
// 2. REUSABLE UI COMPONENT LIBRARY
// ==========================================

/**
 * Tombol Universal dengan varian style
 */
const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, type = "button", disabled = false }) => {
  const baseStyle = "px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#064E3B] text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5",
    secondary: "bg-white text-emerald-900 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md",
    gold: "bg-amber-400 text-emerald-950 hover:bg-amber-500 shadow-lg shadow-amber-400/30",
    outline: "border-2 border-white/20 text-white hover:bg-white/10",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-emerald-700"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children} {Icon && <Icon size={18}/>}
    </button>
  );
};

/**
 * Header Seksi Standar
 */
const SectionHeader = ({ subtitle, title, description, align = "center", light = false }) => (
  <div className={`mb-16 max-w-3xl mx-auto ${align === "center" ? "text-center" : "text-left"}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`inline-block py-1.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-widest mb-4 border ${light ? 'bg-white/10 text-amber-300 border-white/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
      className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 ${light ? 'text-white' : 'text-emerald-950'}`}
    >
      {title}
    </motion.h2>
    {description && (
      <motion.p 
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        className={`text-lg leading-relaxed ${light ? 'text-emerald-100/80' : 'text-gray-500'}`}
      >
        {description}
      </motion.p>
    )}
  </div>
);

/**
 * Komponen Accordion untuk FAQ
 */
const Accordion = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-emerald-600' : 'text-gray-800 group-hover:text-emerald-600'}`}>
          {title}
        </span>
        <span className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-emerald-100 text-emerald-600 rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50'}`}>
          <ChevronDown size={20}/>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 leading-relaxed pl-1">{children}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 3. LAYOUT COMPONENTS
// ==========================================

const Navbar = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  useEffect(() => scrollY.onChange((latest) => setScrolled(latest > 50)), [scrollY]);

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Fitur', path: '/#features' },
    { label: 'Menu Favorit', path: '/#menu' },
    { label: 'FAQ', path: '/#faq' },
    { label: 'Tentang Kami', path: '/about' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled ? 'py-3' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className={`
            flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500
            ${scrolled 
              ? "bg-white/85 backdrop-blur-xl border border-white/60 shadow-lg shadow-emerald-900/5" 
              : "bg-transparent"}
          `}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group z-50 select-none">
               <div className={`p-2 rounded-xl shadow-sm transition-all duration-500 ${scrolled ? 'bg-emerald-50 text-emerald-600' : 'bg-gradient-to-br from-[#064e3b] to-emerald-600 text-white'}`}>
                  <Leaf size={20} fill="currentColor"/>
               </div>
               <span className={`font-black text-xl tracking-tight transition-colors ${scrolled ? 'text-emerald-950' : 'text-emerald-950'}`}>
                  Upgradeats<span className="text-amber-500">.</span>
               </span>
            </Link>

            {/* Desktop Menu */}
            <div className={`hidden lg:flex items-center gap-8 text-sm font-bold transition-colors ${scrolled ? 'text-gray-600' : 'text-gray-700'}`}>
               {navLinks.map((item, i) => (
                 <a key={i} href={item.path} className="hover:text-emerald-600 transition-colors relative group py-2">
                   {item.label}
                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
                 </a>
               ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Link to="/admin/login" className={`hidden md:flex px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${scrolled ? 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600' : 'bg-white/60 text-emerald-800 hover:bg-white backdrop-blur-sm'}`}>
                  Admin
                </Link>
                <a href="https://wa.me/6285832841485" target="_blank" className="hidden md:flex bg-[#064e3b] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-0.5 transition-all items-center gap-2 group">
                   Pesan <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform"/>
                </a>
                {/* Mobile Toggle */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2.5 text-emerald-900 bg-emerald-50 rounded-full hover:bg-emerald-100 transition active:scale-95">
                   {mobileOpen ? <X size={24}/> : <MenuIcon size={24}/>}
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col pt-32 px-8"
          >
             <div className="flex flex-col gap-6">
                {navLinks.map((item, i) => (
                  <motion.a 
                    key={i} 
                    href={item.path} 
                    onClick={() => setMobileOpen(false)} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-3xl font-extrabold text-emerald-950 border-b border-gray-100 pb-4 flex justify-between items-center active:text-amber-500"
                  >
                    {item.label} <ChevronRight size={24} className="text-gray-300"/>
                  </motion.a>
                ))}
             </div>
             <div className="mt-auto mb-12 space-y-4">
                <a href="https://wa.me/6285832841485" className="flex items-center justify-center w-full py-4 bg-[#064e3b] text-white rounded-2xl font-bold text-lg shadow-xl">
                   Pesan Sekarang
                </a>
                <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="block text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                   Login sebagai Admin
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="relative mt-32 bg-[#064E3B] text-white overflow-hidden">
    {/* Wavy SVG (Desain Lama yg Disukai) */}
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180 transform -translate-y-[99%]">
        <svg className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-[#064E3B]"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-[#064E3B]"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#064E3B]"></path>
        </svg>
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-8 pt-10 pb-16 relative z-10">
       <div className="grid md:grid-cols-12 gap-12 mb-20 border-b border-white/10 pb-12">
          <div className="md:col-span-5 space-y-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md"><Leaf className="text-amber-400" size={28}/></div>
                <h2 className="text-3xl font-black tracking-tight text-white">Upgradeats<span className="text-amber-400">.</span></h2>
             </div>
             <p className="text-emerald-100/70 leading-relaxed text-lg max-w-md">
                Platform katering sehat mahasiswa #1. Ubah gaya hidupmu menjadi lebih produktif dengan asupan nutrisi terbaik setiap hari.
             </p>
             <div className="flex gap-4 pt-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                   <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-emerald-950 hover:border-amber-500 transition-all duration-300 hover:-translate-y-1"><Icon size={20}/></a>
                ))}
             </div>
          </div>
          
          <div className="md:col-span-3">
             <h4 className="text-lg font-bold text-amber-400 mb-8 uppercase tracking-widest text-xs">Navigasi</h4>
             <ul className="space-y-4 text-emerald-100/80 font-medium">
                {['Beranda', 'Fitur Unggulan', 'Menu Sehat', 'Tentang Kami', 'Kontak'].map(item => (
                    <li key={item} className="hover:text-white cursor-pointer flex items-center gap-2 transition-colors group">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all"></span> {item}
                    </li>
                ))}
             </ul>
          </div>

          <div className="md:col-span-4">
             <h4 className="text-lg font-bold text-amber-400 mb-8 uppercase tracking-widest text-xs">Hubungi Kami</h4>
             <ul className="space-y-6 text-emerald-100/80">
                <li className="flex items-start gap-4">
                    <MapPin size={24} className="text-amber-400 mt-1 flex-shrink-0"/> 
                    <span>Gedung Serbaguna Kampus<br/>(Stand Utama No. 4, Lantai Dasar)</span>
                </li>
                <li className="flex items-center gap-4">
                    <Phone size={24} className="text-amber-400 flex-shrink-0"/> 
                    <span className="text-lg font-mono font-bold">+62 897-3170-628</span>
                </li>
                <li className="flex items-center gap-4">
                    <Mail size={24} className="text-amber-400 flex-shrink-0"/> 
                    <span>halo@upgradeats.id</span>
                </li>
             </ul>
          </div>
       </div>
       
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-emerald-200/40 text-sm font-medium">
          <p>&copy; 2025 Upgradeats Team. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">Dibuat dengan <Heart size={14} className="text-red-500 fill-red-500"/> di Indonesia.</p>
       </div>
    </div>
  </footer>
);

// ==========================================
// 4. HOMEPAGE SECTIONS
// ==========================================

const HomePage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  
  // Filter States
  const [menuFilter, setMenuFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: prod } = await supabase.from('products').select('*').order('id');
      const { data: feat } = await supabase.from('features').select('*').order('id');
      if (prod) setProducts(prod);
      if (feat) setFeatures(feat);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if(!feedback.trim()) return;
    const { error } = await supabase.from('feedbacks').insert([{ message: feedback }]);
    if(!error) { alert("Pesan terkirim! Terima kasih."); setFeedback(""); }
  };

  // Advanced Filtering Logic
  const filteredProducts = products.filter(item => {
    const matchesCategory = menuFilter === "Semua" || item.category?.toLowerCase().includes(menuFilter.toLowerCase());
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const iconMap = { ShieldCheck, Leaf, Clock, Zap, Star, Heart };
  const DynamicIcon = ({ name }) => {
      const IconComponent = iconMap[name] || ShieldCheck; 
      return <IconComponent size={32}/>;
  };

  // Dummy Data for Testimonials
  const testimonials = [
      { name: "Budi Santoso", role: "Mahasiswa Teknik", text: "Sumpah ini ngebantu banget buat anak kosan yg mager masak tapi pengen sehat!" },
      { name: "Siti Aminah", role: "Mahasiswa Ekonomi", text: "Harganya pas di kantong, rasanya bintang lima. Langganan tiap hari!" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#FDFCF8] font-sans selection:bg-amber-200 selection:text-emerald-900">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 px-6 overflow-visible">
         {/* Abstract Blobs */}
         <motion.div style={{ y: yParallax }} className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-b from-amber-100/40 to-transparent rounded-full blur-[150px] -z-10 mix-blend-multiply"/>
         <motion.div style={{ y: yParallax }} className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply"/>

         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 relative z-10">
               <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-emerald-100 rounded-full shadow-sm backdrop-blur-sm hover:shadow-md transition-all cursor-default">
                  <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">#1 Healthy Food on Campus</span>
               </motion.div>

               <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-7xl font-extrabold text-emerald-950 leading-[0.95] tracking-tighter">
                  Boost Your Foods, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 animate-gradient-x">
                     Upgrade your Life.
                  </span>
               </motion.h1>
               
               <motion.p variants={fadeInUp} className="text-xl text-gray-600 leading-relaxed max-w-lg font-medium border-l-4 border-amber-400 pl-6">
                  Revolusi makanan kampus. Sajian <span className="text-emerald-700 font-bold">nutrisi tinggi</span> dengan rasa bintang lima, harga mahasiswa.
               </motion.p>

               <motion.div variants={fadeInUp} className="flex flex-wrap gap-5 pt-4">
                  <Button onClick={() => document.getElementById('menu').scrollIntoView({behavior: 'smooth'})} icon={ChevronRight}>Lihat Menu</Button>
                  <Button variant="secondary" onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})} icon={Sparkles}>Kenapa Kami?</Button>
               </motion.div>
               
               <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-[#FDFCF8] bg-gray-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover"/>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-gray-500">
                    <span className="text-emerald-600 text-lg">500+</span> <br/> Mahasiswa Puas
                  </div>
               </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative flex justify-center lg:justify-end">
               <div className="relative z-10">
                   <div className="absolute inset-0 bg-amber-200 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                   <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop" alt="Healthy Bowl" 
                      className="w-[550px] h-auto object-contain drop-shadow-2xl rotate-[5deg] hover:rotate-0 transition-all duration-700 ease-out hover:scale-105 cursor-pointer z-10 relative"
                   />
                   {/* Floating Badge Cards */}
                   <motion.div 
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                        className="absolute top-10 -right-4 bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-4 z-20"
                   >
                        <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><Award size={28}/></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality</p>
                            <p className="font-bold text-xl text-emerald-900">Premium</p>
                        </div>
                   </motion.div>
                   <motion.div 
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                        className="absolute bottom-20 -left-8 bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-3 z-20"
                   >
                        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 text-2xl">🥗</div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fresh</p>
                            <p className="font-bold text-lg text-emerald-900">Ingredients</p>
                        </div>
                   </motion.div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* --- MARQUEE --- */}
      <div className="bg-emerald-900 py-4 overflow-hidden transform -rotate-1 mb-20">
        <div className="whitespace-nowrap animate-marquee flex gap-10 text-emerald-200 font-bold text-lg uppercase tracking-widest">
          {[...Array(10)].map((_,i) => (
            <span key={i} className="flex items-center gap-4">Upgradeats <Star size={14} fill="currentColor" className="text-amber-400"/> Healthy Food <Star size={14} fill="currentColor" className="text-amber-400"/></span>
          ))}
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 px-6 relative">
         <div className="max-w-7xl mx-auto">
            <SectionHeader 
              subtitle="Kenapa Kami?" 
              title={<span>Lebih dari Sekadar <span className="text-amber-500 underline decoration-wavy decoration-emerald-200">Makanan.</span></span>}
              description="Kami tidak hanya menjual makanan, kami menawarkan gaya hidup yang lebih baik dan produktif."
            />

            <div className="grid md:grid-cols-3 gap-8">
                {features.length > 0 ? features.map((feat, i) => (
                   <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                      whileHover={{ y: -10 }}
                      className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden"
                   >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mb-8 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm relative z-10">
                         <DynamicIcon name={feat.icon}/>
                      </div>
                      <h3 className="text-2xl font-extrabold text-emerald-950 mb-4 relative z-10">{feat.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-lg relative z-10">{feat.text}</p>
                   </motion.div>
                )) : (
                  [1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse"/>)
                )}
            </div>
         </div>
      </section>

      {/* --- MENU SECTION --- */}
      <section id="menu" className="py-32 px-6 relative">
         <div className="max-w-7xl mx-auto">
            <SectionHeader 
              subtitle="Menu Favorit" 
              title="Pilihan Rasa Bintang Lima"
            />

            {/* Menu Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
               {/* Filter Tabs */}
               <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                  {['Semua', 'Best Seller', 'Segar Alami', 'Dessert'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setMenuFilter(cat)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${menuFilter === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>

               {/* Search Bar */}
               <div className="relative w-full md:w-80">
                  <input 
                    type="text" 
                    placeholder="Cari menu..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
               </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-3 gap-10">
                  {[1,2,3].map(i => <div key={i} className="h-[400px] bg-gray-100 rounded-[2.5rem] animate-pulse"/>)}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredProducts.length > 0 ? filteredProducts.map((item, i) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}
                            className="group bg-white p-4 rounded-[2.5rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 border border-white flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="h-72 overflow-hidden rounded-[2rem] relative bg-gray-100">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-extrabold text-emerald-800 shadow-sm flex items-center gap-1.5 border border-white/50">
                                    <Sparkles size={12} className="text-amber-500"/> {item.category}
                                </div>
                            </div>
                            
                            <div className="p-6 pt-8 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-extrabold text-emerald-950 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">{item.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed">{item.description || 'Menu spesial Upgradeats yang wajib dicoba.'}</p>

                                <div className="mt-auto flex items-center justify-between gap-4">
                                    <span className="text-xl font-black text-emerald-600">{item.price}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/product/${item.id}`)} className="p-3.5 rounded-2xl border border-gray-200 text-gray-400 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all group/eye">
                                            <Eye size={20} className="group-hover/eye:scale-110 transition-transform"/>
                                        </button>
                                        <button onClick={() => navigate(`/product/${item.id}`)} className="px-6 py-3.5 rounded-2xl bg-[#064e3b] text-white font-bold hover:bg-emerald-800 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                                            Beli <ShoppingCart size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                      <div className="col-span-3 text-center py-20">
                        <p className="text-gray-400 text-lg font-medium">Menu yang kamu cari belum tersedia :(</p>
                      </div>
                    )}
                </div>
            )}
         </div>
      </section>
      
      {/* --- FAQ SECTION (NEW) --- */}
      <section id="faq" className="py-20 px-6 bg-white">
         <div className="max-w-3xl mx-auto">
            <SectionHeader subtitle="FAQ" title="Pertanyaan Umum" description="Hal-hal yang sering ditanyakan oleh mahasiswa." />
            
            <div className="space-y-2">
                <Accordion 
                    title="Apakah Upgradeats halal?" 
                    isOpen={activeFaq === 0} onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                >
                  Tentu saja! 100% bahan kami halal dan diproses dengan standar kebersihan yang ketat sesuai syariat.
                </Accordion>
                <Accordion 
                    title="Bisa pesan untuk acara kampus?" 
                    isOpen={activeFaq === 1} onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                >
                  Bisa banget! Kami menerima pesanan dalam jumlah besar (prasmanan/kotak) untuk event himpunan atau seminar. Hubungi WA kami H-3.
                </Accordion>
                <Accordion 
                    title="Dimana lokasi pickup?" 
                    isOpen={activeFaq === 2} onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                >
                  Kamu bisa ambil pesananmu di Stand Utama No. 4, Gedung Serbaguna, Lantai Dasar. Buka jam 09.00 - 17.00.
                </Accordion>
                <Accordion 
                    title="Apakah ada opsi vegetarian?" 
                    isOpen={activeFaq === 3} onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
                >
                  Ada dong! Salad Wrap dan beberapa menu dessert kami cocok untuk vegetarian. Cek kategori "Segar Alami".
                </Accordion>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-20 px-6 bg-[#FDFCF8]">
          <div className="max-w-7xl mx-auto">
             <SectionHeader subtitle="Testimoni" title="Kata Mereka" />
             <div className="grid md:grid-cols-2 gap-8">
                 {testimonials.map((testi, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex text-amber-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                        <p className="text-gray-600 italic text-lg mb-6">"{testi.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">{testi.name.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-emerald-950">{testi.name}</p>
                                <p className="text-xs text-gray-400 uppercase font-bold">{testi.role}</p>
                            </div>
                        </div>
                    </motion.div>
                 ))}
             </div>
          </div>
      </section>

      {/* --- NEWSLETTER & FEEDBACK --- */}
      <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-[#064E3B] rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-emerald-900/20 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-amber-300 shadow-inner">
                  <Smile size={40}/>
              </div>
              <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Suara Kamu,<br/>Semangat Kami.</h2>
                  <p className="text-emerald-100/80 text-lg leading-relaxed">
                    Punya kritik, saran, atau ide menu baru? Kirimkan langsung ke dapur kami!
                  </p>
              </div>
              <div className="flex items-center gap-4 font-bold text-amber-300 bg-black/20 p-4 rounded-2xl w-fit border border-white/5 backdrop-blur-sm">
                <Check size={20} className="bg-amber-400 text-black rounded-full p-0.5"/> <span>Admin fast response.</span>
              </div>
            </div>
            
            <form onSubmit={handleFeedback} className="bg-white p-3 rounded-[2.5rem] shadow-2xl">
                <textarea 
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-8 rounded-[2rem] bg-gray-50 text-gray-900 border-none focus:ring-0 focus:bg-emerald-50/50 outline-none h-48 resize-none text-lg placeholder:text-gray-400 transition-all"
                  placeholder="Tulis pesan rahasia untuk chef di sini..."
                ></textarea>
                <button type="submit" className="w-full py-5 bg-amber-400 text-emerald-950 rounded-2xl font-extrabold hover:bg-amber-300 transition-all text-lg flex items-center justify-center gap-3 mt-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                   Kirim Pesan <Send size={20} className="-rotate-45 mt-1"/>
                </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// ==========================================
// 5. PAGE: ABOUT US
// ==========================================

const AboutPage = () => {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('team_members').select('*').order('id');
      if (data) setTeams(data);
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFCF5] font-sans selection:bg-amber-200">
      <Navbar />
      
      {/* Header */}
      <div className="pt-48 pb-32 px-6 text-center relative overflow-hidden">
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: "circOut" }} className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-100/60 rounded-full blur-[120px]"/>
         <SectionHeader 
           subtitle="Tentang Kami" 
           title="Kenalan Yuk!" 
           description="Di balik makanan sehat yang enak, ada tim mahasiswa yang penuh semangat dan dedikasi tinggi untuk mengubah pola makan kampus."
         />
      </div>

      {/* Story */}
      <section className="px-6 pb-32">
         <div className="max-w-6xl mx-auto bg-white p-12 md:p-20 rounded-[4rem] shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold uppercase tracking-wider border border-amber-100">
                        <History size={18}/> Our Journey
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 leading-tight">Dari Tugas Kuliah Menjadi <span className="text-emerald-600 underline decoration-amber-400 decoration-4 underline-offset-4">Passion.</span></h2>
                    <div className="space-y-6 text-gray-500 text-lg leading-relaxed">
                        <p>Upgradeats bermula dari keresahan kami: "Kenapa makanan sehat di kampus mahal atau rasanya hambar?"</p>
                        <p>Sebagai Kelompok 1 Kewirausahaan, kami bereksperimen di dapur rumahan, mencari supplier lokal yang berkualitas, hingga akhirnya menemukan formula rasa yang pas dan harga yang ramah di kantong.</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-600 rounded-[3rem] rotate-6 opacity-20 scale-95 blur-lg"></div>
                    <img src="/fotoku.jpg" alt="Team Working" className="relative rounded-[3rem] shadow-2xl rotate-3 border-8 border-white grayscale hover:grayscale-0 transition-all duration-500 transform hover:rotate-0"/>
                </div>
            </div>
         </div>
      </section>

      {/* Team */}
      <section className="px-6 pb-40">
         <div className="max-w-7xl mx-auto">
            <SectionHeader subtitle="Dream Team" title="Wajah di Balik Layar" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
               {teams.map((member, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: "spring" }} viewport={{ once: true }}
                     whileHover={{ y: -10 }}
                     className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group relative"
                  >
                     <div className="h-96 overflow-hidden relative bg-gray-200">
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-8">
                            <Quote className="text-amber-400 mb-2 fill-amber-400" size={30}/>
                            <p className="text-white text-lg italic font-medium leading-relaxed">"{member.quote}"</p>
                        </div>
                     </div>
                     <div className="p-8 text-center relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#FFFCF5] rounded-full p-2 shadow-sm flex items-center justify-center">
                           <div className="w-full h-full bg-amber-400 rounded-full flex items-center justify-center text-emerald-900 font-bold text-3xl shadow-inner">{member.name.charAt(0)}</div>
                        </div>
                        <h3 className="font-bold text-2xl text-emerald-950 mt-10 mb-1">{member.name}</h3>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full inline-block">{member.role}</p>
                        
                        <div className="flex justify-center gap-4 mt-6 opacity-40 group-hover:opacity-100 transition-opacity">
                             <Linkedin size={20} className="hover:text-blue-600 cursor-pointer"/>
                             <Mail size={20} className="hover:text-red-500 cursor-pointer"/>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* Fun Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-50 to-amber-50 border-2 border-dashed border-emerald-200 rounded-[3rem] p-12 text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-lg"><Lock size={36}/></div>
              <h3 className="text-2xl font-extrabold text-emerald-900 mb-4">Eits, Tertarik dengan Anggota Kami? 😜</h3>
              <p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto text-lg">Kalau mau minta nomor WhatsApp, minimal <strong>Beli Dulu</strong> produk Upgradeats dong! Cintai produknya dulu, baru orangnya (bercanda✌️).</p>
              <Button onClick={() => window.location.href = '/#menu'} icon={HeartHandshake}>Beli Dulu Baru Modus</Button>
            </motion.div>
         </div>
      </section>
      <Footer />
    </div>
  );
}

// ==========================================
// 6. PAGE: DETAIL PRODUK
// ==========================================

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const getProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data);
    };
    getProduct();
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#FFFCF5]"><div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/></div>;

  const handleOrder = async () => {
    const customerName = prompt("Atas nama siapa kak?");
    if(!customerName) return;
    const priceClean = parseInt(product.price.replace(/[^0-9]/g, ''));
    const totalPrice = (priceClean * qty).toLocaleString('id-ID');
    
    await supabase.from('orders').insert({ 
        customer_name: customerName, 
        product_name: product.name, 
        qty: qty, 
        total_price: `Rp ${totalPrice}`, 
        status: 'Pending' 
    });
    
    const text = `Halo Upgradeats!%0A%0ASaya *${customerName}* mau pesan:%0AMenu: *${product.name}*%0AJumlah: *${qty}*%0ATotal: *Rp ${totalPrice}*%0A%0AMohon diproses ya!`;
    window.open(`https://wa.me/6285832841485?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFFCF5] font-sans selection:bg-amber-200">
      <Navbar />
      <main className="grid lg:grid-cols-2 min-h-screen">
           {/* Left Side: Image */}
           <div className="relative h-[50vh] lg:h-screen overflow-hidden bg-gray-100">
              <button onClick={() => navigate(-1)} className="absolute top-28 left-8 z-30 bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-full hover:bg-white hover:text-emerald-900 text-white transition shadow-lg group">
                 <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
              </button>
              <img src={product.image_url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-12 text-white z-20">
                 <span className="bg-amber-400 text-emerald-950 px-4 py-1.5 rounded-lg font-extrabold text-xs uppercase tracking-wider mb-6 inline-block shadow-lg">{product.category}</span>
                 <h1 className="text-5xl lg:text-7xl font-extrabold mb-4 leading-none">{product.name}</h1>
                 <p className="text-white/80 text-lg font-medium italic border-l-4 border-amber-400 pl-4">"Rasa Bintang Lima, Harga Mahasiswa"</p>
              </div>
           </div>

           {/* Right Side: Details */}
           <div className="p-8 lg:p-24 lg:pt-32 flex flex-col justify-center bg-white">
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                  <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
                      <div>
                        <p className="text-gray-400 text-xs font-extrabold uppercase tracking-widest mb-2">Harga Satuan</p>
                        <h2 className="text-5xl font-extrabold text-emerald-600 tracking-tight">{product.price}</h2>
                      </div>
                      <div className="text-right">
                        <div className="flex text-amber-400 mb-2 justify-end"><Star size={20} fill="currentColor"/><Star size={20} fill="currentColor"/><Star size={20} fill="currentColor"/><Star size={20} fill="currentColor"/><Star size={20} fill="currentColor"/></div>
                        <p className="text-sm text-gray-400 font-bold">4.9 (128 Reviews)</p>
                      </div>
                  </div>
                  
                  <div className="space-y-6 mb-12">
                    <h3 className="font-extrabold text-2xl text-emerald-950">Deskripsi Menu</h3>
                    <p className="text-gray-500 text-lg leading-relaxed">{product.description || "Menu andalan kami dengan bahan premium yang diolah oleh chef berpengalaman. Dijamin bikin nagih!"}</p>
                    
                    <div className="grid grid-cols-3 gap-4 py-6">
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                            <Flame className="mx-auto text-orange-500 mb-2"/>
                            <p className="font-bold text-gray-800">250</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Kcal</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                            <Zap className="mx-auto text-blue-500 mb-2"/>
                            <p className="font-bold text-gray-800">20g</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Protein</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                            <Leaf className="mx-auto text-emerald-500 mb-2"/>
                            <p className="font-bold text-gray-800">100%</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Fresh</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-[2rem] shadow-inner border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                     <div className="flex items-center bg-white rounded-2xl p-2 border border-gray-200 shadow-sm w-full sm:w-auto justify-between">
                        <button onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition font-bold text-xl text-gray-500">-</button>
                        <span className="w-12 text-center font-extrabold text-xl text-gray-800">{qty}</span>
                        <button onClick={() => setQty(qty+1)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-xl transition font-bold text-xl text-gray-500">+</button>
                     </div>
                     <button onClick={handleOrder} className="w-full flex-1 py-5 bg-[#064e3b] text-white rounded-2xl font-bold text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 flex justify-center items-center gap-3 hover:-translate-y-1">
                        Pesan Sekarang <ArrowUpRight/>
                     </button>
                  </div>
              </motion.div>
           </div>
      </main>
    </div>
  );
};

// ==========================================
// 7. MAIN APP ROUTER
// ==========================================

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;