import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import {
  IconStore, IconShield, IconPhone, IconPin,
  IconCalendar, IconSearch, IconSpinner, IconBuildingStore,
  IconQrCode, IconDownload, IconPrint, IconClose, IconEdit, IconCheck, IconCamera,
} from '../components/Icons';

import { API_BASE } from '../config/api';

export default function StorePage() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [storeData, setStoreData] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modallar
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Düzenleme Formu
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  const qrPrintRef = useRef(null);

  const fetchStore = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/listings/store/${id}`);
      if (data.success) {
        setStoreData(data.store);
        setListings(data.listings || []);
        setEditForm({
          name: data.store.name || '',
          phone: data.store.phone || '',
          avatar: data.store.avatar || '',
        });
      } else {
        setStoreData(null);
        setListings([]);
      }
    } catch (err) {
      console.error('Mağaza verisi alınamadı:', err);
      setStoreData(null);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [id]);

  // Giriş yapmış kullanıcı bu mağazanın sahibi mi?
  const isOwner = user && (user.id === id || user._id === id);

  // Fotoğraf dosyasını Base64'e dönüştür
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setEditError('Profil görseli en fazla 4MB olabilir.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Mağaza URL'i (QR kod için)
  const currentStoreUrl = typeof window !== 'undefined' ? window.location.href : `http://localhost:5173/magaza/${id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&format=png&data=${encodeURIComponent(currentStoreUrl)}`;

  // QR Kodu Yazdır
  const handlePrintQr = () => {
    window.print();
  };

  // Mağaza Bilgilerini Güncelle
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const { data } = await axios.put(
        `${API_BASE}/auth/profile`,
        { name: editForm.name, phone: editForm.phone, avatar: editForm.avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setEditSuccess(true);
        setStoreData((prev) => ({
          ...prev,
          name: data.user.name,
          phone: data.user.phone,
          avatar: data.user.avatar || prev.avatar,
        }));
        setTimeout(() => {
          setEditSuccess(false);
          setShowEditModal(false);
        }, 1200);
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Bilgiler güncellenirken hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredListings = listings.filter((l) =>
    searchTerm ? l.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const getInitials = (name) => {
    if (!name) return 'EP';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'EP';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <IconSpinner size={36} color="#d97706" />
          <span className="text-sm font-bold text-slate-700">Mağaza Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <IconStore size={28} color="#d97706" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Mağaza Bulunamadı</h2>
          <p className="text-sm text-slate-500 mb-6">
            Bu mağaza veya dükkan henüz aktif bir ilana sahip olmayabilir.
          </p>
          <Link to="/" className="btn-primary px-6 py-2.5 rounded-xl font-bold inline-block text-xs">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = storeData.createdAt
    ? new Date(storeData.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : 'Yeni Üye';

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-16">
      
      {/* ===== SAF SİYAH & TURUNCU KONSEPTLİ LÜKS MAĞAZA BANNER'I (MAVİ YOK) ===== */}
      <div className="bg-[#0b0f17] text-white pt-10 pb-16 px-4 border-b border-neutral-800 relative overflow-hidden">
        {/* Lüks Turuncu / Amber Arka Plan Parlaması */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
            
            {/* Sol Taraf: Avatar & Bilgiler */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
              {/* Büyük Mağaza Avatarı (Görsel Varsa Fotoğraf, Yoksa Baş Harfler) */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-2xl ring-4 ring-neutral-800 flex-shrink-0 overflow-hidden relative">
                {storeData.avatar ? (
                  <img
                    src={storeData.avatar}
                    alt={storeData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(storeData.name)
                )}
              </div>

              {/* Bilgiler */}
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {storeData.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    <IconShield size={13} color="#f59e0b" />
                    Doğrulanmış Esnaf Mağazası
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 text-xs text-neutral-300 mb-4">
                  <span className="flex items-center gap-1.5">
                    <IconPin size={14} color="#f59e0b" />
                    {storeData.city || 'Türkiye'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconCalendar size={14} color="#f59e0b" />
                    Üyelik: {joinDate}
                  </span>
                  <span className="flex items-center gap-1.5 bg-neutral-800/90 border border-neutral-700/80 px-2.5 py-0.5 rounded-md font-bold text-amber-400">
                    <IconBuildingStore size={13} color="#f59e0b" />
                    {listings.length} Aktif İlan
                  </span>
                </div>

                {/* Telefon Butonu */}
                {storeData.phone && (
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <a
                      href={`tel:${storeData.phone}`}
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md"
                    >
                      <IconPhone size={15} color="#f59e0b" />
                      <span>{storeData.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Sağ Taraf: Dükkan QR Kod & Düzenle Butonları */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* QR Kod Butonu (Her dükkan için özel) */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                id="open-qr-modal-btn"
              >
                <IconQrCode size={17} color="#0f172a" />
                <span>Dükkan QR Kodu</span>
              </button>

              {/* Mağaza Sahibiyse: Mağazayı / Numarayı Düzenle */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  id="edit-store-profile-btn"
                >
                  <IconEdit size={15} color="#f59e0b" />
                  <span>Mağazamı Düzenle</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ===== MAĞAZA İLANLARI VİTRİNİ ===== */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <IconStore size={19} color="#d97706" />
                Mağaza Vitrini ve Tüm İlanları
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bu dükkan / satıcı tarafından yayınlanan aktif ilanlar ({filteredListings.length})
              </p>
            </div>

            {/* Mağaza İçi İlan Arama */}
            {listings.length > 2 && (
              <div className="relative w-full sm:w-64">
                <IconSearch size={14} color="#94a3b8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Bu mağazada ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
              </div>
            )}
          </div>

          {/* İlan Grid Listesi */}
          <div className="pt-6">
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredListings.map((listing, idx) => (
                  <ListingCard key={listing._id || idx} listing={listing} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-200/60">
                  <IconStore size={26} color="#d97706" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Aramanıza Uygun İlan Bulunamadı</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Farklı bir anahtar kelime deneyebilir veya mağazanın tüm ilanlarını görüntüleyebilirsiniz.
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Aramayı Temizle
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===== 1. DÜKKAN ÖZEL QR KOD MODALI (YAZDIR / İNDİR / CAMA YAPIŞTIR) ===== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative text-center">
            
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <IconClose size={18} color="currentColor" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <IconQrCode size={22} color="#d97706" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Dükkanınızın Özel QR Kodu
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Müşterileriniz telefonlarıyla bu QR kodu okuttuğunda doğrudan bu mağazanıza ve tüm ilanlarınıza ulaşır!
            </p>

            {/* QR Kod Çerçevesi (Yazdırılabilir Alan) */}
            <div ref={qrPrintRef} className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 shadow-inner mb-5">
              <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                <img
                  src={qrCodeUrl}
                  alt={`${storeData.name} QR Kodu`}
                  className="w-48 h-48 mx-auto block"
                />
              </div>
              <div className="text-amber-400 font-extrabold text-sm mt-3 truncate">
                {storeData.name}
              </div>
              <div className="text-slate-400 text-[11px]">
                EsnafPano Yerel Mağaza Vitrini
              </div>
            </div>

            {/* Aksiyonlar */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrCodeUrl}
                download={`${storeData.name.replace(/\s+/g, '_')}_QR_Kod.png`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                <IconDownload size={15} color="#0f172a" />
                <span>QR İndir</span>
              </a>
              <button
                type="button"
                onClick={handlePrintQr}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <IconPrint size={15} color="#0f172a" />
                <span>Yazdır (Cama As)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 2. MAĞAZA & NUMARA DÜZENLEME MODALI ===== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <IconClose size={18} color="currentColor" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <IconEdit size={20} color="#d97706" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Mağaza Bilgilerini Düzenle</h3>
                <p className="text-xs text-slate-500">İşletme adınızı ve telefon numaranızı güncelleyin</p>
              </div>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <IconCheck size={16} color="#059669" />
                <span>Mağaza bilgileriniz başarıyla güncellendi!</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Profil / Logo Fotoğrafı */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mağaza / Profil Fotoğrafı
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-slate-400">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} alt="Önizleme" className="w-full h-full object-cover" />
                    ) : (
                      <IconCamera size={22} color="#94a3b8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-block py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                      Fotoğraf Seç (Cihazdan)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (Maks 4MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mağaza / İşletme Adı
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Örn: Lezzet Durağı Lokantası veya Ad Soyad"
                  required
                  className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  İletişim Telefon Numarası
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                  required
                  className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Bu numara mağazanızda ve tüm ilanlarınızda güncellenir.
                </p>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {editLoading ? <IconSpinner size={16} color="#0f172a" /> : <IconCheck size={16} color="#0f172a" />}
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
