import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import {
  IconStore, IconPlus, IconEdit, IconTrash, IconEye,
  IconCheckCircle, IconWarning, IconSpinner, IconPin, IconClose,
  IconBriefcase, IconWrench, IconCar, IconMotorcycle, IconBuildingStore,
  IconClock, IconGlobe, IconTools,
} from '../components/Icons';

import { API_BASE } from '../config/api';

const CATEGORIES = [
  'Dükkan & İşletme Tanıtımı',
  'Kafe & Restoran',
  'Oto Sanayi & Araç Bakım',
  'Hizmet/Ustalık',
  'İş Arıyorum',
  'Eleman Aranıyor',
  'Dükkan Devir/Kiralama',
  'Vasıta & Araç',
  'Motosiklet',
];

export default function MyListingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Düzenleme Modalı State
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Kullanıcının ilanlarını çek
  const fetchMyListings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/listings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && Array.isArray(data.data)) {
        setListings(data.data);
      } else {
        setListings([]);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'İlanlar yüklenirken bir sorun oluştu.' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/giris');
    } else {
      fetchMyListings();
    }
  }, [user, fetchMyListings, navigate]);

  // İlan silme
  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" başlıklı ilanı silmek istediğinizden emin misiniz?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessage({ type: 'success', text: 'İlan başarıyla silindi.' });
        setListings((prev) => prev.filter((l) => l._id !== id));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'İlan silinirken hata oluştu.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // Hızlı Durum Değiştirme (Aktif <-> Satıldı)
  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'sold' : 'active';
    setActionLoading(true);
    try {
      const { data } = await axios.put(
        `${API_BASE}/listings/${listing._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === listing._id ? { ...l, status: newStatus } : l))
        );
        setMessage({
          type: 'success',
          text: `İlan durumu "${newStatus === 'active' ? 'Aktif' : 'Satıldı / Tamamlandı'}" olarak güncellendi.`,
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Durum güncellenirken bir hata oluştu.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  // Düzenleme Modalını Aç
  const openEditModal = (item) => {
    setEditingListing(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      businessType: item.businessType || '',
      businessFeatures: item.businessFeatures || [],
      workingHours: item.workingHours || '',
      websiteOrSocial: item.websiteOrSocial || '',
      price: item.price || '',
      priceLabel: item.priceLabel || '',
      city: item.city || '',
      district: item.district || '',
      contactPhone: item.contactPhone || '',
      whatsappLink: item.whatsappLink || '',
      images: item.images || [],
      status: item.status || 'active',
    });
  };

  // Düzenleme Formunu Gönder
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...editForm,
        price: editForm.price ? Number(editForm.price) : undefined,
      };
      const { data } = await axios.put(`${API_BASE}/listings/${editingListing._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessage({ type: 'success', text: 'İlan başarıyla güncellendi.' });
        setListings((prev) =>
          prev.map((l) => (l._id === editingListing._id ? data.data : l))
        );
        setEditingListing(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Güncelleme başarısız.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <IconWarning size={32} color="#f59e0b" className="mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Giriş Yapmanız Gerekiyor</h2>
          <p className="text-sm text-slate-500 mb-6">
            Kendi ilanlarınızı görüntülemek ve yönetmek için lütfen hesabınıza giriş yapın.
          </p>
          <Link to="/giris" className="btn-primary w-full py-3 block text-center rounded-xl font-bold">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Başlık & Eylem Çubuğu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
              Hesap Paneli
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              İlanlarım &amp; İlan Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user.name} ({user.email}) — Yayınladığınız tüm ilanları buradan yönetebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {(user?._id || user?.id) && (
              <Link
                to={`/magaza/${user._id || user.id}`}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-md transition-all"
                id="my-store-btn"
              >
                <IconBuildingStore size={16} color="#f59e0b" />
                <span>Mağazamı Görüntüle</span>
              </Link>
            )}
            <Link
              to="/ilan-ver"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all"
            >
              <IconPlus size={16} color="#0f172a" />
              <span>Yeni İlan Ekle</span>
            </Link>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{listings.length}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Toplam İlan</div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{activeCount}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Yayında (Aktif)</div>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-500">{soldCount}</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">Satıldı / Kapalı</div>
          </div>
        </div>

        {/* Bildirim Mesajı */}
        {message.text && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <IconCheckCircle size={18} color="#047857" />
            ) : (
              <IconWarning size={18} color="#dc2626" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* İlan Listesi */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-28 rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((item) => {
              const hasImage = item.images && item.images.length > 0 && Boolean(item.images[0]);
              const priceText = item.priceLabel || (item.price ? `${item.price.toLocaleString('tr-TR')} ₺` : 'Fiyat Belirtilmedi');

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Sol: Görsel & Başlık */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {hasImage ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <IconStore size={28} color="#94a3b8" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {item.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.status === 'active' ? '● Yayında' : '○ Satıldı / Pasif'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-slate-900">{priceText}</span>
                        <span>•</span>
                        <span>{item.district}, {item.city}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ: İşlem Butonları */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <Link
                      to={`/ilan/${item._id}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1"
                      title="İlanı Sayfasında Gör"
                    >
                      <IconEye size={16} color="#475569" />
                      <span className="hidden md:inline">Gör</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      disabled={actionLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        item.status === 'active'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                      title="Durumu Değiştir"
                    >
                      {item.status === 'active' ? 'Satıldı Yap' : 'Yayına Al'}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      disabled={actionLoading}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <IconEdit size={14} color="#78350f" />
                      Düzenle
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.title)}
                      disabled={actionLoading}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                      title="İlanı Kalıcı Olarak Sil"
                    >
                      <IconTrash size={16} color="#dc2626" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Henüz İlan Yok */
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <IconStore size={32} color="#d97706" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Henüz Bir İlan Yayınlamadınız</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto mb-6">
              İster araba satın, ister ustalık hizmeti verin, ister eleman arayın. İlk ilanınızı 2 dakikada kolayca oluşturabilirsiniz.
            </p>
            <Link
              to="/ilan-ver"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <IconPlus size={16} color="#0f172a" />
              İlk İlanınızı Oluşturun
            </Link>
          </div>
        )}

      </div>

      {/* ===== İLAN DÜZENLEME MODALI ===== */}
      {editingListing && editForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">İlanı Düzenle</h2>
                <p className="text-xs text-slate-500">Değişiklikleri yaptıktan sonra kaydet butonuna basın</p>
              </div>
              <button
                onClick={() => setEditingListing(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <IconClose size={16} color="#475569" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İlan Başlığı</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlan Durumu</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="active">Aktif (Yayında)</option>
                    <option value="sold">Satıldı / Kapalı</option>
                  </select>
                </div>
              </div>

              {/* Dükkan / İşletme Alanları */}
              {editForm.category === 'Dükkan & İşletme Tanıtımı' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İşletme Sektörü</label>
                    <input
                      type="text"
                      value={editForm.businessType || ''}
                      onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
                      placeholder="Örn: Oto Sanayi & Tamir / Servis, Kafe, Hırdavat..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Çalışma Gün &amp; Saatleri</label>
                      <input
                        type="text"
                        value={editForm.workingHours || ''}
                        onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
                        placeholder="Örn: Hafta içi: 08:30 - 19:00 | Pazar Kapalı"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Web Sitesi / Instagram</label>
                      <input
                        type="text"
                        value={editForm.websiteOrSocial || ''}
                        onChange={(e) => setEditForm({ ...editForm, websiteOrSocial: e.target.value })}
                        placeholder="Örn: instagram.com/isletmeadi"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat (Sayısal ₺)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="Örn: 450000"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fiyat Etiketi (Örn: Pazarlıklı, Aylık)</label>
                  <input
                    type="text"
                    value={editForm.priceLabel}
                    onChange={(e) => setEditForm({ ...editForm, priceLabel: e.target.value })}
                    placeholder="Örn: 450.000 ₺ (Pazarlıklı)"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Şehir</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İletişim Telefonu</label>
                <input
                  type="text"
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detaylı Açıklama</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              {/* Görsel Yükleme Bileşeni */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">İlan Fotoğrafları</label>
                <ImageUploader
                  images={editForm.images || []}
                  onChange={(newImgs) => setEditForm({ ...editForm, images: newImgs })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <IconSpinner size={16} color="#0f172a" /> : null}
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
