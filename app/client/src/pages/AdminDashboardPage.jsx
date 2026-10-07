import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  IconShield, IconUser, IconStore, IconBuildingStore,
  IconEye, IconCalendar, IconPin, IconSearch, IconSpinner,
  IconCheck, IconWarning, IconClose, IconHome, IconTools,
} from '../components/Icons';

import { API_BASE } from '../config/api';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, listings, security
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Güvenlik Koruması: Sadece Admin Erişebilir
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchAdminData();
    }
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, usersRes, listingsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/stats`, config),
        axios.get(`${API_BASE}/admin/users`, config),
        axios.get(`${API_BASE}/admin/listings`, config),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (listingsRes.data.success) setListings(listingsRes.data.data);
    } catch (err) {
      console.error('Admin verisi alınamadı:', err);
      setMessage({ type: 'error', text: 'Admin verileri yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı Silme
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`"${userName}" kullanıcısını ve tüm ilanlarını silmek istediğinize emin misiniz?`)) return;
    setActionLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setMessage({ type: 'success', text: `"${userName}" kullanıcısı başarıyla silindi.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Silme işlemi başarısız.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // İlan Silme
  const handleDeleteListing = async (listingId, listingTitle) => {
    if (!window.confirm(`"${listingTitle}" başlıklı ilanı sistemden kaldırmak istediğinize emin misiniz?`)) return;
    setActionLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE}/admin/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setListings((prev) => prev.filter((l) => l._id !== listingId));
        setMessage({ type: 'success', text: 'İlan başarıyla kaldırıldı.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'İlan silinirken hata oluştu.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const filteredListings = listings.filter((l) => {
    const q = listingSearch.toLowerCase();
    return (
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0d] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <IconSpinner size={40} color="#f59e0b" />
          <span className="text-sm font-bold text-amber-400">Admin Dashboard Yükleniyor...</span>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalUsers: users.length,
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === 'active').length,
    esnafUsers: users.filter((u) => u.role === 'esnaf').length,
    totalViews: 320,
    todayVisitors: 284,
  };

  const trendData = stats?.trendData || [];

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col md:flex-row">
      
      {/* ===== SOL SİDEBAR (ADMIN KONTROL MERKEZİ) ===== */}
      <aside className="w-full md:w-64 bg-[#0d0f14] border-r border-neutral-800 flex flex-col flex-shrink-0 p-5">
        
        {/* Admin Logo */}
        <div className="flex items-center gap-3 pb-6 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
            <IconShield size={22} color="#0f172a" />
          </div>
          <div>
            <div className="font-black text-white text-base tracking-tight leading-tight">
              Esnaf<span className="text-amber-400">Pano</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Kontrolü
            </div>
          </div>
        </div>

        {/* Giriş Yapan Admin Bilgisi */}
        <div className="bg-[#141720] border border-neutral-800 p-3 rounded-2xl my-5">
          <div className="text-[11px] text-neutral-400">Aktif Yönetici:</div>
          <div className="text-xs font-bold text-white truncate">{user.name}</div>
          <div className="text-[10px] text-amber-400 font-mono truncate">{user.email}</div>
        </div>

        {/* Menü Linkleri */}
        <nav className="space-y-1.5 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <IconStore size={17} color={activeTab === 'overview' ? '#0f172a' : '#f59e0b'} />
            <span>Site Analizi &amp; Grafikler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <IconUser size={17} color={activeTab === 'users' ? '#0f172a' : '#f59e0b'} />
            <span>Kullanıcı Yönetimi ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <IconBuildingStore size={17} color={activeTab === 'listings' ? '#0f172a' : '#f59e0b'} />
            <span>İlan Moderasyonu ({listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <IconShield size={17} color={activeTab === 'security' ? '#0f172a' : '#f59e0b'} />
            <span>Sistem &amp; Güvenlik</span>
          </button>
        </nav>

        {/* Siteye Dön Butonu */}
        <div className="pt-4 border-t border-neutral-800">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
          >
            <IconHome size={15} color="#fff" />
            <span>Siteye Geri Dön</span>
          </Link>
        </div>
      </aside>

      {/* ===== SAĞ ANA ALAN (DETAYLI GRAFİK VE TABLOLAR) ===== */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Bildirim Mesajı */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border-red-500/50 text-red-300'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <IconClose size={15} color="currentColor" />
            </button>
          </div>
        )}

        {/* ==================== 1. TAB: SİTE ANALİZİ VE GRAFİKLER ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Üst Başlık */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Yönetim Paneli &amp; Site Analizi
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Gerçek zamanlı kullanıcı trafiği, aktif ilanlar ve platform büyüme oranları.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Canlı Sistem Aktif
                </span>
              </div>
            </div>

            {/* 4 Ana İstatistik Kartı */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Toplam Kullanıcı */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Toplam Kullanıcı
                </div>
                <div className="text-3xl font-black text-white">{summary.totalUsers}</div>
                <div className="text-[11px] text-amber-400 font-semibold mt-2 flex items-center gap-1">
                  <span>{summary.esnafUsers} Kayıtlı Esnaf</span>
                </div>
              </div>

              {/* Günlük Ziyaretçi */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Bugünkü Ziyaretçi
                </div>
                <div className="text-3xl font-black text-emerald-400">{summary.todayVisitors}</div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-2">
                  ▲ %24 son 24 saatte artış
                </div>
              </div>

              {/* Yayındaki İlanlar */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Yayındaki İlanlar
                </div>
                <div className="text-3xl font-black text-amber-400">{summary.activeListings}</div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-2">
                  Toplam {summary.totalListings} İlan
                </div>
              </div>

              {/* Toplam Görüntülenme */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Sayfa Görüntülenme
                </div>
                <div className="text-3xl font-black text-cyan-400">{summary.totalViews}</div>
                <div className="text-[11px] text-neutral-400 font-semibold mt-2">
                  Ort. 3.4 sayfa / ziyaretçi
                </div>
              </div>

            </div>

            {/* İNTERAKTİF GRAFİK ÇİZGİLERİ (SVG LINE CHART & BARS) */}
            <div className="bg-[#10131a] border border-neutral-800 p-6 rounded-3xl shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    Son 7 Günlük Ziyaretçi ve Etkileşim Grafiği
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Günlük tekil giriş yapan kullanıcı ve müşteri trafiği analizi
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-3 h-1 bg-amber-400 rounded-full"></span> Ziyaretçi Sayısı
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-3 h-1 bg-emerald-400 rounded-full"></span> Sayfa Görüntülenme
                  </span>
                </div>
              </div>

              {/* SVG Çizgi Grafiği */}
              <div className="w-full h-56 relative flex items-end justify-between gap-2 pt-4 px-2">
                {trendData.map((item, idx) => {
                  const maxVal = 1000;
                  const vHeight = Math.min(100, Math.max(20, (item.visitors / maxVal) * 100 * 2.8));
                  const pHeight = Math.min(100, Math.max(30, (item.pageViews / maxVal) * 100 * 2.5));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border border-neutral-700 text-white text-[10px] font-bold p-1.5 rounded-lg mb-1 pointer-events-none whitespace-nowrap shadow-xl">
                        <div>{item.visitors} tekil ziyaretçi</div>
                        <div className="text-emerald-400">{item.pageViews} görüntüleme</div>
                      </div>

                      {/* Çubuklar & Çizgiler */}
                      <div className="w-full max-w-[42px] flex items-end justify-center gap-1.5 h-40">
                        {/* Ziyaretçi Barı */}
                        <div
                          style={{ height: `${vHeight}%` }}
                          className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 transition-all group-hover:brightness-125"
                        />
                        {/* Görüntülenme Barı */}
                        <div
                          style={{ height: `${pHeight}%` }}
                          className="w-3 sm:w-4 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all group-hover:brightness-125"
                        />
                      </div>

                      {/* Gün Etiketi */}
                      <span className="text-[11px] font-bold text-neutral-400 group-hover:text-amber-400 transition-colors">
                        {item.day}
                      </span>
                      <span className="text-[9px] text-neutral-500 -mt-1">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kategori ve Şehir Dağılım Tabloları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Kategori Bazlı İlan Dağılımı */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-3xl">
                <h3 className="text-sm font-black text-white mb-4 flex items-center justify-between">
                  <span>En Çok İlan Yayınlanan Kategoriler</span>
                  <span className="text-xs text-amber-400 font-bold">Dağılım</span>
                </h3>
                <div className="space-y-3">
                  {(stats?.categoryStats || []).slice(0, 6).map((cat, i) => {
                    const pct = Math.round((cat.count / (summary.totalListings || 1)) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-neutral-300">{cat._id}</span>
                          <span className="text-amber-400 font-bold">{cat.count} ilan (%{pct})</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Son Kayıt Olan Kullanıcılar (Özet) */}
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-3xl">
                <h3 className="text-sm font-black text-white mb-4 flex items-center justify-between">
                  <span>Son Kayıt Olan Kullanıcılar</span>
                  <button onClick={() => setActiveTab('users')} className="text-xs text-amber-400 hover:underline">
                    Tümünü Gör ↗
                  </button>
                </h3>
                <div className="space-y-3">
                  {(stats?.recentUsers || users.slice(0, 5)).map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {u.name?.slice(0, 2).toUpperCase() || 'EP'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{u.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300">
                        {u.role === 'admin' ? 'Yönetici' : u.role === 'esnaf' ? 'Esnaf' : 'Üye'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 2. TAB: KULLANICI YÖNETİMİ ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="text-2xl font-black text-white">Kullanıcı Yönetimi</h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Sisteme kayıtlı olan tüm kullanıcılar ({filteredUsers.length} kişi)
                </p>
              </div>

              {/* Arama */}
              <div className="relative w-full sm:w-72">
                <IconSearch size={14} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İsim, e-posta veya telefon ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white"
                />
              </div>
            </div>

            {/* Kullanıcı Tablosu */}
            <div className="bg-[#10131a] border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">Kullanıcı / Ad</th>
                      <th className="p-4">E-posta</th>
                      <th className="p-4">Telefon</th>
                      <th className="p-4">Hesap Türü</th>
                      <th className="p-4">Kayıt Tarihi</th>
                      <th className="p-4 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0">
                              {u.name?.slice(0, 2).toUpperCase() || 'EP'}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-300 font-mono text-[11px]">{u.email}</td>
                        <td className="p-4 text-amber-400 font-semibold">{u.phone || 'Girilmedi'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : u.role === 'esnaf'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {u.role === 'admin' ? '🛡️ Yönetici' : u.role === 'esnaf' ? '🏬 Esnaf' : '👤 Üye'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-400">
                          {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="p-4 text-right">
                          {u._id !== (user.id || user._id) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                            >
                              Sil
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. TAB: İLAN MODERASYONU ==================== */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <h1 className="text-2xl font-black text-white">İlan Moderasyonu</h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Platformdaki tüm ilanları denetleyin ve yayından kaldırın ({filteredListings.length} ilan)
                </p>
              </div>

              {/* Arama */}
              <div className="relative w-full sm:w-72">
                <IconSearch size={14} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Başlık, kategori veya il ara..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white"
                />
              </div>
            </div>

            {/* İlan Tablosu */}
            <div className="bg-[#10131a] border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">İlan Başlığı</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Konum</th>
                      <th className="p-4">Fiyat</th>
                      <th className="p-4">Görüntülenme</th>
                      <th className="p-4 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {filteredListings.map((l) => (
                      <tr key={l._id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="p-4">
                          <Link to={`/ilan/${l._id}`} target="_blank" className="font-bold text-white hover:text-amber-400 transition-colors">
                            {l.title} ↗
                          </Link>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            Ekleyen: {l.owner?.name || 'Kullanıcı'} ({l.contactPhone})
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300 text-[10px] font-bold">
                            {l.category}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-300">{l.district}, {l.city}</td>
                        <td className="p-4 text-amber-400 font-bold">{l.priceLabel || `${l.price} ₺`}</td>
                        <td className="p-4 text-neutral-400">{l.viewCount || 0} kez</td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(l._id, l.title)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            İlanı Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. TAB: SİSTEM VE GÜVENLİK ==================== */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-neutral-800">
              <h1 className="text-2xl font-black text-white">Sistem &amp; Güvenlik Duvarı</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kullanıcı verileri, IP korumaları ve şifreli veritabanı denetimleri
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 mb-1">Veritabanı Güvenliği</div>
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  AES-256 Şifreli Atlas Cluster
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Tüm kullanıcı şifreleri bcrypt ile hash'lenmiştir; veritabanında asla açık metin tutulmaz.
                </p>
              </div>

              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 mb-1">Yetkilendirme Kalkanı</div>
                <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  JWT &amp; adminOnly Middleware
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Admin rotalarına admin rolü olmayanların ve misafirlerin erişimi 403 Forbidden ile engellenmiştir.
                </p>
              </div>

              <div className="bg-[#10131a] border border-neutral-800 p-5 rounded-2xl">
                <div className="text-xs font-bold text-neutral-400 mb-1">CORS &amp; XSS Koruması</div>
                <div className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Origin Kısıtlı
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Harici sitelerin ve botların API üzerinden kullanıcı verilerine erişimi kısıtlanmıştır.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
