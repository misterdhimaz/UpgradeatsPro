import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Coffee, Users, MessageSquare, LogOut, 
  Plus, Trash, PenSquare, XCircle, TrendingUp, DollarSign, ShoppingBag, 
  ShieldCheck, Menu, X, Sparkles, Clock, Leaf, Zap, Star, Heart, Search, 
  Image as ImageIcon, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Settings, 
  FileText, User, Bell, Lock, Eye, Printer, Receipt
} from 'lucide-react';

// ==========================================
// 1. UTILITY & HELPER FUNCTIONS
// ==========================================

const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '') || 0) : value;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

const formatDate = (dateString) => {
  if(!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// ==========================================
// 2. REUSABLE UI COMPONENTS
// ==========================================

const Badge = ({ children, color = "emerald", icon: Icon }) => {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${colors[color] || colors.gray}`}>
      {Icon && <Icon size={12}/>}
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false, type="button" }) => {
  const variants = {
    primary: "bg-[#064E3B] text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
    gold: "bg-yellow-400 text-emerald-950 hover:bg-yellow-500 shadow-lg shadow-yellow-400/30"
  };

  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18}/>}
      {children}
    </motion.button>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
    <input 
      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl font-semibold text-gray-700 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400"
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
    <textarea 
      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl font-semibold text-gray-700 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400 resize-none min-h-[120px]"
      {...props}
    />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-50"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <div className={`bg-white w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl pointer-events-auto border border-gray-100 ${title === 'Detail Pesanan' ? 'max-w-md' : 'max-w-2xl'}`}>
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                 {title === 'Detail Pesanan' && <Receipt size={20} className="text-emerald-600"/>}
                 {title}
              </h3>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-500 transition"><X size={20}/></button>
            </div>
            <div className="p-8">
              {children}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border border-white/20 backdrop-blur-md
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}
  >
    {type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
    <span className="font-bold text-sm">{message}</span>
    <button onClick={onClose}><X size={16} className="opacity-60 hover:opacity-100"/></button>
  </motion.div>
);

const DynamicIcon = ({ name }) => {
  const iconMap = { ShieldCheck, Leaf, Clock, Zap, Star, Heart };
  const IconComponent = iconMap[name] || Star;
  return <IconComponent size={24}/>;
};

// ==========================================
// 3. MAIN DASHBOARD
// ==========================================

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Global State
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // New: Loading Auth State
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data Store
  const [dataStore, setDataStore] = useState({
    products: [], orders: [], teams: [], features: [], feedbacks: []
  });
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalMenus: 0 });

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // Modal & Form
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
  const [formData, setFormData] = useState({});

  // 1. INIT & AUTH CHECK
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      // Cek Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }
      
      setIsAuthChecking(false); // Auth OK
      await fetchAllData(); // Fetch Data setelah Auth OK
    };
    
    checkAuthAndFetch();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [prod, ord, team, feat, feed] = await Promise.all([
        supabase.from('products').select('*').order('id'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('id'),
        supabase.from('features').select('*').order('id'),
        supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
      ]);

      const products = prod.data || [];
      const orders = ord.data || [];
      
      setDataStore({
        products,
        orders,
        teams: team.data || [],
        features: feat.data || [],
        feedbacks: feed.data || []
      });

      let totalRev = 0;
      orders.forEach(o => totalRev += parseInt(o.total_price.replace(/[^0-9]/g, '') || 0));
      setStats({ revenue: totalRev, totalOrders: orders.length, totalMenus: products.length });

    } catch (error) {
      showToast("Gagal memuat data: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. HELPERS
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin/login'); };

  const openModal = (type, data = null) => {
    setModalConfig({ isOpen: true, type, data });
    setFormData(data || {}); 
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null });
    setFormData({});
  };

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  // 3. CRUD OPERATIONS
  const handleSubmit = async (e, table) => {
    e.preventDefault();
    const payload = { ...formData };
    
    let error;
    if (modalConfig.data?.id) {
       const res = await supabase.from(table).update(payload).eq('id', modalConfig.data.id);
       error = res.error;
    } else {
       const res = await supabase.from(table).insert([payload]);
       error = res.error;
    }

    if (error) showToast(error.message, 'error');
    else {
      showToast('Data berhasil disimpan!', 'success');
      closeModal();
      fetchAllData();
    }
  };

  const handleDelete = async (table, id) => {
    if (confirm('Hapus data ini selamanya?')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if(error) showToast(error.message, 'error');
      else {
        showToast('Data dihapus', 'success');
        fetchAllData();
      }
    }
  };

  const handleBulkDelete = async (table) => {
    if (selectedItems.length === 0) return;
    
    let tableName = '';
    if(activeTab === 'menu') tableName = 'products';
    else if(activeTab === 'team') tableName = 'team_members';
    else if(activeTab === 'features') tableName = 'features';
    else if(activeTab === 'feedbacks') tableName = 'feedbacks';

    if (!tableName) return;

    if (confirm(`Hapus ${selectedItems.length} item yang dipilih?`)) {
      const { error } = await supabase.from(tableName).delete().in('id', selectedItems);
      if (error) showToast(error.message, 'error');
      else {
        showToast(`${selectedItems.length} data dihapus`, 'success');
        setSelectedItems([]);
        fetchAllData();
      }
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) showToast('Gagal update status', 'error');
    else {
        showToast(`Status order #${id} diubah ke ${newStatus}`, 'success');
        setDataStore(prev => ({
            ...prev,
            orders: prev.orders.map(o => o.id === id ? { ...o, status: newStatus } : o)
        }));
        if(modalConfig.isOpen && modalConfig.data.id === id) {
             setModalConfig(prev => ({...prev, data: {...prev.data, status: newStatus}}));
        }
    }
  };

  // 4. FILTERING & PAGINATION
  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'menu') data = dataStore.products;
    else if (activeTab === 'orders') data = dataStore.orders;
    else if (activeTab === 'team') data = dataStore.teams;
    else if (activeTab === 'features') data = dataStore.features;
    else if (activeTab === 'feedbacks') data = dataStore.feedbacks;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.name && item.name.toLowerCase().includes(lower)) ||
        (item.title && item.title.toLowerCase().includes(lower)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(lower)) ||
        (item.message && item.message.toLowerCase().includes(lower))
      );
    }
    return data;
  };

  const filteredData = getFilteredData();
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); setSearchTerm(""); setSelectedItems([]); }, [activeTab]);

  // 5. RENDER UI HELPERS
  const SidebarLink = ({ id, icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden mb-1
      ${activeTab === id ? 'bg-white/10 text-white font-bold shadow-inner' : 'text-emerald-100/60 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={`relative z-10 transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
      <span className="relative z-10 text-sm tracking-wide">{label}</span>
      {activeTab === id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full shadow-[0_0_15px_#facc15]"></div>}
    </button>
  );

  // --- LOADING SCREEN FOR AUTH ---
  if (isAuthChecking) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#FDFCF8]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-800 font-bold text-sm uppercase tracking-widest animate-pulse">Verifikasi Admin...</p>
           </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans text-gray-800 overflow-hidden selection:bg-emerald-200 selection:text-emerald-900">
      
      <AnimatePresence>{toast && <Toast {...toast} onClose={() => setToast(null)} />}</AnimatePresence>

      {/* --- MODALS --- */}
      {modalConfig.isOpen && (
        <Modal 
          isOpen={modalConfig.isOpen} 
          onClose={closeModal} 
          title={
            modalConfig.type === 'order_detail' ? 'Detail Pesanan' :
            modalConfig.data ? `Edit ${modalConfig.type}` : `Tambah ${modalConfig.type}`
          }
        >
          {/* 1. ORDER DETAIL (STRUK STYLE) */}
          {modalConfig.type === 'order_detail' && modalConfig.data && (
             <div className="flex flex-col h-full">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 font-mono text-sm relative overflow-hidden">
                    {/* Struk Decoration */}
                    <div className="absolute -bottom-3 left-0 w-full h-6 bg-white" style={{ maskImage: 'radial-gradient(circle, transparent 50%, black 50%)', maskSize: '20px 20px', maskRepeat: 'repeat-x' }}></div>

                    <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest">Upgradeats</h2>
                        <p className="text-xs text-gray-500">Gedung Serbaguna Kampus</p>
                        <p className="text-xs text-gray-500">Order ID: #{modalConfig.data.id}</p>
                        <p className="text-xs text-gray-500">{new Date(modalConfig.data.created_at).toLocaleString()}</p>
                    </div>

                    <div className="space-y-4 mb-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Customer:</span>
                            <span className="font-bold">{modalConfig.data.customer_name}</span>
                        </div>
                        <div className="border-b border-dashed border-gray-300 pb-2">
                            <div className="flex justify-between font-bold mb-1">
                                <span>{modalConfig.data.product_name}</span>
                                <span>{modalConfig.data.total_price}</span>
                            </div>
                            <div className="text-xs text-gray-500">Qty: {modalConfig.data.qty}</div>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>TOTAL</span>
                            <span>{modalConfig.data.total_price}</span>
                        </div>
                    </div>

                    <div className="text-center border-t-2 border-dashed border-gray-300 pt-4 mt-4">
                        <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase border ${modalConfig.data.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : modalConfig.data.status === 'Dibatalkan' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                            {modalConfig.data.status}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Terima kasih telah berbelanja!</p>
                    </div>
                </div>

                <div className="pt-6 mt-auto flex flex-col gap-3">
                    <div className="flex gap-3 justify-end">
                         {modalConfig.data.status === 'Pending' && (
                             <>
                                <Button variant="danger" icon={XCircle} onClick={() => handleUpdateOrderStatus(modalConfig.data.id, 'Dibatalkan')}>Tolak</Button>
                                <Button icon={CheckCircle} onClick={() => handleUpdateOrderStatus(modalConfig.data.id, 'Selesai')}>Terima & Selesai</Button>
                             </>
                        )}
                        {modalConfig.data.status !== 'Pending' && (
                            <p className="text-sm text-gray-400 italic w-full text-center">Pesanan ini telah {modalConfig.data.status.toLowerCase()}.</p>
                        )}
                    </div>
                    <Button variant="secondary" icon={Printer} onClick={() => window.print()} className="w-full">Cetak Struk</Button>
                </div>
             </div>
          )}

          {/* 2. MENU FORM */}
          {modalConfig.type === 'Product' && (
             <form onSubmit={(e)=>handleSubmit(e, 'products')} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <InputField label="Nama Menu" required value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})} />
                    <InputField label="Harga (Rp)" required value={formData.price||''} onChange={e=>setFormData({...formData, price:e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <InputField label="Kategori" required value={formData.category||''} onChange={e=>setFormData({...formData, category:e.target.value})} />
                    <InputField label="Image URL" required value={formData.image_url||''} onChange={e=>setFormData({...formData, image_url:e.target.value})} />
                </div>
                <TextAreaField label="Deskripsi" value={formData.description||''} onChange={e=>setFormData({...formData, description:e.target.value})} />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal}>Batal</Button>
                    <Button type="submit" icon={CheckCircle}>Simpan Menu</Button>
                </div>
             </form>
          )}

          {/* 3. FEATURE FORM */}
          {modalConfig.type === 'Feature' && (
             <form onSubmit={(e)=>handleSubmit(e, 'features')} className="space-y-5">
                <InputField label="Judul Fitur" required value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})} />
                <TextAreaField label="Deskripsi" required value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})} />
                <div className="space-y-2">
                   <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Pilih Ikon</label>
                   <div className="grid grid-cols-6 gap-3">
                      {['ShieldCheck', 'Leaf', 'Clock', 'Zap', 'Star', 'Heart'].map(ic => (
                          <div key={ic} onClick={()=>setFormData({...formData, icon:ic})} 
                              className={`p-3 rounded-xl flex justify-center cursor-pointer transition-all border ${formData.icon === ic ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300'}`}>
                              <DynamicIcon name={ic}/>
                          </div>
                      ))}
                   </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal}>Batal</Button>
                    <Button type="submit" icon={CheckCircle}>Simpan Fitur</Button>
                </div>
             </form>
          )}

          {/* 4. TEAM FORM */}
          {modalConfig.type === 'Team' && (
             <form onSubmit={(e)=>handleSubmit(e, 'team_members')} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <InputField label="Nama Lengkap" required value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})} />
                    <InputField label="Jabatan" required value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})} />
                </div>
                <InputField label="Foto Profil URL" required value={formData.image_url||''} onChange={e=>setFormData({...formData, image_url:e.target.value})} />
                <TextAreaField label="Quote / Motto" required value={formData.quote||''} onChange={e=>setFormData({...formData, quote:e.target.value})} />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal}>Batal</Button>
                    <Button type="submit" icon={CheckCircle}>Simpan Anggota</Button>
                </div>
             </form>
          )}
        </Modal>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:static top-0 left-0 h-full bg-[#022c22] text-white z-50 transition-all duration-500 flex flex-col justify-between w-72 shadow-2xl md:shadow-none border-r border-emerald-900
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-emerald-950 shadow-lg shadow-amber-500/20">
                    <Sparkles size={20} fill="currentColor"/>
                </div>
                <div>
                    <span className="font-bold text-2xl text-white tracking-tight leading-none block">Admin<span className="text-amber-400">.</span></span>
                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-[0.2em]">Upgradeats</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                <div className="px-4 mb-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Main</div>
                <SidebarLink id="overview" icon={<LayoutDashboard size={18}/>} label="Overview" />
                <SidebarLink id="orders" icon={<ShoppingBag size={18}/>} label="Transaksi" />
                
                <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Manage</div>
                <SidebarLink id="menu" icon={<Coffee size={18}/>} label="Menu Makanan" />
                <SidebarLink id="team" icon={<Users size={18}/>} label="Tim & Staff" />
                <SidebarLink id="features" icon={<ShieldCheck size={18}/>} label="Fitur Unggulan" />
                <SidebarLink id="feedbacks" icon={<MessageSquare size={18}/>} label="Kotak Pesan" />
                
                <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System</div>
                <SidebarLink id="settings" icon={<Settings size={18}/>} label="Pengaturan" />
            </nav>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-[#01221a] m-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">SA</div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-white truncate">Super Admin</p>
                 <p className="text-xs text-emerald-400 truncate">admin@upgradeats.id</p>
             </div>
             <button onClick={handleLogout} className="text-red-400 hover:text-white transition"><LogOut size={18}/></button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-20 sticky top-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={24}/></button>
                <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">{activeTab.replace('_', ' ')}</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <input 
                        type="text" 
                        placeholder="Cari data..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-emerald-200 border border-transparent outline-none transition-all w-64"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold border-2 border-white shadow-sm">A</div>
            </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-[#FDFCF8]">
            <div className="max-w-7xl mx-auto pb-24">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center pt-40 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-emerald-700 font-bold animate-pulse">Sinkronisasi Data...</p>
                        </div>
                    ) : (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} transition={{duration:0.4}}>
                            
                            {/* --- 1. OVERVIEW --- */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    {/* Welcome Banner */}
                                    <div className="bg-[#022c22] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="relative z-10 max-w-xl space-y-4">
                                            <Badge color="emerald" icon={Sparkles}>System Online v2.4</Badge>
                                            <h2 className="text-4xl font-bold leading-tight">Dashboard <span className="text-amber-400">Overview.</span></h2>
                                            <p className="text-emerald-100/80 text-lg">Halo Admin! Berikut adalah ringkasan performa bisnis Upgradeats hari ini.</p>
                                            <div className="flex gap-3 pt-2">
                                                <Button variant="gold" onClick={()=>setActiveTab('orders')} icon={FileText}>Lihat Laporan</Button>
                                                <Button className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-md" onClick={()=>setActiveTab('menu')}>Kelola Menu</Button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500/30 blur-[80px] rounded-full animate-pulse"></div>
                                            <div className="w-64 h-40 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-center">
                                                <TrendingUp size={64} className="text-emerald-400/50"/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stat Cards - Clean & Modern */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                         {[
                                            { label: "Pendapatan", val: formatCurrency(stats.revenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                                            { label: "Pesanan", val: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                                            { label: "Menu Aktif", val: stats.totalMenus, icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
                                         ].map((s, i) => (
                                            <motion.div key={i} whileHover={{y:-5}} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5">
                                                <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>{<s.icon size={28}/>}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                                                    <h3 className="text-2xl font-extrabold text-gray-800">{s.val}</h3>
                                                </div>
                                            </motion.div>
                                         ))}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Clock size={20} className="text-gray-400"/> Aktivitas Terbaru</h3>
                                            <div className="space-y-6 relative before:absolute before:left-2 before:h-full before:w-0.5 before:bg-gray-100">
                                                {orders.slice(0, 3).map((o, i) => (
                                                    <div key={i} className="relative pl-8">
                                                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                                                        <p className="text-sm font-bold text-gray-800">Pesanan Baru #{o.id}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Diterima dari {o.customer_name}.</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-[#fffbeb] p-8 rounded-[2.5rem] border border-amber-100">
                                            <h3 className="font-bold text-xl mb-4 text-amber-900">Quick Actions</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={()=>openModal('Product')} className="p-4 bg-white rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition text-left group">
                                                    <Plus className="mb-2 text-amber-500 group-hover:scale-110 transition"/>
                                                    <p className="font-bold text-gray-800">Tambah Menu</p>
                                                </button>
                                                <button onClick={()=>openModal('Team')} className="p-4 bg-white rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition text-left group">
                                                    <User className="mb-2 text-amber-500 group-hover:scale-110 transition"/>
                                                    <p className="font-bold text-gray-800">Tambah Staff</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 2. CRUD TABS (Menu, Team, Features) --- */}
                            {['menu', 'team', 'features'].includes(activeTab) && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Button icon={Plus} onClick={() => openModal(activeTab === 'menu' ? 'Product' : activeTab === 'team' ? 'Team' : 'Feature')}>Tambah</Button>
                                            {selectedItems.length > 0 && <Button variant="danger" icon={Trash} onClick={() => handleBulkDelete(activeTab === 'menu' ? 'products' : activeTab === 'team' ? 'team_members' : 'features')}>Hapus ({selectedItems.length})</Button>}
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                            <button onClick={()=>setViewMode('grid')} className={`p-2 rounded-md transition ${viewMode==='grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}><LayoutDashboard size={18}/></button>
                                            <button onClick={()=>setViewMode('list')} className={`p-2 rounded-md transition ${viewMode==='list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}><Menu size={18}/></button>
                                        </div>
                                    </div>

                                    {paginatedData.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                            <Search size={40} className="mx-auto text-gray-300 mb-4"/>
                                            <p className="text-gray-400 font-medium">Data tidak ditemukan.</p>
                                        </div>
                                    ) : (
                                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                                            {paginatedData.map(item => (
                                                <motion.div 
                                                    key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className={`bg-white border border-gray-100 hover:border-emerald-300 transition-all group relative overflow-hidden cursor-pointer
                                                        ${viewMode === 'grid' ? 'p-6 rounded-[2.5rem] flex flex-col hover:shadow-xl hover:-translate-y-1' : 'p-4 rounded-2xl flex items-center gap-6 hover:shadow-md'}
                                                        ${selectedItems.includes(item.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : ''}
                                                    `}
                                                    onClick={() => toggleSelect(item.id)}
                                                >
                                                    <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 z-20 flex items-center justify-center transition-colors ${selectedItems.includes(item.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 bg-white/80'}`}>
                                                        {selectedItems.includes(item.id) && <CheckCircle size={14} className="text-white"/>}
                                                    </div>

                                                    <div className={viewMode === 'grid' ? "mb-6 relative mx-auto" : "w-16 h-16 flex-shrink-0"}>
                                                        {item.icon ? (
                                                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100"><DynamicIcon name={item.icon}/></div>
                                                        ) : (
                                                            <img src={item.image_url} className={`object-cover bg-gray-100 shadow-md ${viewMode === 'grid' ? 'w-full h-40 rounded-2xl' : 'w-16 h-16 rounded-xl'}`} />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                                        <h4 className="font-extrabold text-gray-800 text-lg truncate">{item.name || item.title}</h4>
                                                        <p className="text-emerald-600 font-bold text-sm">{activeTab === 'menu' ? item.price : (item.role || 'Fitur Unggulan')}</p>
                                                        {viewMode === 'grid' && <p className="text-gray-400 text-xs mt-2 line-clamp-2">{item.description || item.text || item.quote}</p>}
                                                    </div>

                                                    <div className={`flex gap-2 ${viewMode === 'grid' ? 'mt-6 pt-4 border-t border-gray-50 justify-center' : 'ml-auto'}`}>
                                                        <button onClick={(e)=>{e.stopPropagation(); openModal(activeTab === 'menu' ? 'Product' : activeTab === 'team' ? 'Team' : 'Feature', item)}} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition"><PenSquare size={18}/></button>
                                                        <button onClick={(e)=>{e.stopPropagation(); handleDelete(activeTab === 'menu' ? 'products' : activeTab === 'team' ? 'team_members' : 'features', item.id)}} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash size={18}/></button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="flex justify-center gap-4 mt-8 items-center">
                                        <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"><ChevronLeft/></button>
                                        <span className="text-sm font-bold text-gray-500">Halaman {currentPage} dari {pageCount}</span>
                                        <button disabled={currentPage===pageCount} onClick={()=>setCurrentPage(p=>p+1)} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"><ChevronRight/></button>
                                    </div>
                                </div>
                            )}

                            {/* --- 3. ORDERS TAB --- */}
                            {activeTab === 'orders' && (
                                <Card noPadding>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[900px]">
                                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                                <tr>
                                                    {['ID', 'Pelanggan', 'Menu Item', 'Total', 'Status', 'Aksi'].map(h => (
                                                        <th key={h} className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-widest">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {paginatedData.map(order => (
                                                    <tr key={order.id} onClick={() => openModal('order_detail', order)} className="hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                                                        <td className="p-6 font-mono text-xs text-gray-500">#{order.id}</td>
                                                        <td className="p-6">
                                                            <div className="font-bold text-gray-800">{order.customer_name}</div>
                                                            <div className="text-xs text-gray-400">{formatDate(order.created_at)}</div>
                                                        </td>
                                                        <td className="p-6">
                                                            <span className="font-medium text-gray-700">{order.product_name}</span>
                                                            <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-500">x{order.qty}</span>
                                                        </td>
                                                        <td className="p-6 font-bold text-emerald-600">{order.total_price}</td>
                                                        <td className="p-6">
                                                            <Badge color={order.status === 'Selesai' ? 'emerald' : order.status === 'Dibatalkan' ? 'red' : 'yellow'}>
                                                                {order.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition"/>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}

                            {/* --- 4. FEEDBACKS TAB --- */}
                            {activeTab === 'feedbacks' && (
                                <div className="grid md:grid-cols-2 gap-6">
                                     {paginatedData.map(fb => (
                                        <div key={fb.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group hover:shadow-xl hover:-translate-y-1 transition-all">
                                            <div className="absolute top-8 right-8 text-gray-200 group-hover:text-amber-400 transition-colors"><MessageSquare size={32}/></div>
                                            <p className="text-gray-800 text-lg italic font-medium leading-relaxed pr-12 mb-6">"{fb.message}"</p>
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <Clock size={14}/> {formatDate(fb.created_at)}
                                                </p>
                                                <button onClick={()=>handleDelete('feedbacks', fb.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                             {/* --- 5. SETTINGS TAB --- */}
                             {activeTab === 'settings' && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <Card>
                                        <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Pengaturan Akun</h3>
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-24 h-24 bg-emerald-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-emerald-100">SA</div>
                                            <div>
                                                <h4 className="font-bold text-lg">Super Admin</h4>
                                                <p className="text-gray-500 mb-2">admin@upgradeats.id</p>
                                                <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Ubah Foto</Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-4">
                                            <InputField label="Nama Tampilan" defaultValue="Super Admin" />
                                            <InputField label="Email" defaultValue="admin@upgradeats.id" disabled />
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <Button>Simpan Perubahan</Button>
                                        </div>
                                    </Card>
                                    <Card>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-gray-800">Keamanan</h3>
                                                <p className="text-sm text-gray-500">Ubah password dan pengaturan login</p>
                                            </div>
                                            <Button variant="secondary" icon={Lock}>Ganti Password</Button>
                                        </div>
                                    </Card>
                                </div>
                             )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
      </div>
    </div>
  );
}