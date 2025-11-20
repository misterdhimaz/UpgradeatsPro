import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Leaf, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Sukses
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Email atau password salah.' : 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FDFCF8] selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* --- LEFT SIDE: BRANDING & VISUAL (Desktop Only) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#022c22] items-center justify-center p-12">
         {/* Background Decorations */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
         
         <div className="relative z-10 max-w-lg text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.8, ease: "circOut" }}
              className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)]"
            >
                <Leaf size={48} className="text-emerald-950"/>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="text-5xl font-extrabold text-white mb-6 leading-tight"
            >
              Kelola <span className="text-emerald-400">Upgradeats</span><br/>dengan Mudah.
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="text-emerald-100/70 text-lg leading-relaxed"
            >
              Pantau pesanan, atur menu, dan kelola tim dalam satu dashboard yang terintegrasi.
            </motion.p>
         </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
         <motion.div 
           initial={{ opacity: 0, x: 50 }} 
           animate={{ opacity: 1, x: 0 }} 
           transition={{ duration: 0.6 }}
           className="w-full max-w-md"
         >
            <div className="mb-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4">
                 <Sparkles size={12}/> Admin Portal
               </div>
               <h2 className="text-3xl font-black text-gray-900">Selamat Datang Kembali! 👋</h2>
               <p className="text-gray-500 mt-2">Silakan masuk untuk mengakses dashboard admin.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
               {/* Email Input */}
               <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                        <Mail size={20}/>
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl font-semibold text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300"
                      placeholder="nama@upgradeats.id"
                    />
                  </div>
               </div>

               {/* Password Input */}
               <div className="space-y-2 group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 group-focus-within:text-emerald-600 transition-colors">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                        <Lock size={20}/>
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl font-semibold text-gray-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
               </div>

               {/* Error Message */}
               <AnimatePresence>
                 {errorMsg && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                     className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100"
                   >
                     <AlertCircle size={16}/> {errorMsg}
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Submit Button */}
               <motion.button 
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                 disabled={loading}
                 className="w-full py-4 bg-[#064E3B] hover:bg-emerald-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? <Loader2 size={24} className="animate-spin"/> : <>Masuk Dashboard <ArrowRight size={20}/></>}
               </motion.button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-sm text-gray-400">Lupa password? <a href="#" className="text-emerald-600 font-bold hover:underline">Hubungi Tim Teknis</a></p>
            </div>
         </motion.div>

         {/* Mobile Decor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-emerald-50 to-transparent rounded-full blur-3xl -z-10 opacity-60 lg:hidden"></div>
      </div>

    </div>
  );
}