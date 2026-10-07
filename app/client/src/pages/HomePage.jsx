import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import FilterSidebar from '../components/FilterSidebar';
import {
  IconSearch, IconPin, IconStar, IconBriefcase, IconStore, IconWrench,
  IconFilter, IconShield, IconClose, IconPlus, IconInfo, IconCar, IconMotorcycle, IconBuildingStore,
  IconCoffee, IconTools,
} from '../components/Icons';

import { API_BASE } from '../config/api';

const CITIES = [
  'Tüm Şehirler', 'Adana', 'Ankara', 'Antalya', 'Bursa', 'Çanakkale', 'Eskişehir',
  'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Kocaeli', 'Konya', 'Mersin', 'Samsun', 'Trabzon',
];

const CATEGORY_TABS = [
  { label: 'Tüm İlanlar', value: '', Icon: null },
  { label: 'Dükkan & İşletmeler', value: 'Dükkan & İşletme Tanıtımı', Icon: IconBuildingStore },
  { label: 'Kafe & Restoran', value: 'Kafe & Restoran', Icon: IconCoffee },
  { label: 'Oto Sanayi & Bakım', value: 'Oto Sanayi & Araç Bakım', Icon: IconTools },
  { label: 'İş Arıyorum', value: 'İş Arıyorum', Icon: IconBriefcase },
  { label: 'Eleman Aranıyor', value: 'Eleman Aranıyor', Icon: IconBriefcase },
  { label: 'Dükkan Devir & Kira', value: 'Dükkan Devir/Kiralama', Icon: IconStore },
  { label: 'Hizmet & Ustalık', value: 'Hizmet/Ustalık', Icon: IconWrench },
  { label: 'Vasıta & Araç', value: 'Vasıta & Araç', Icon: IconCar },
  { label: 'Motosiklet', value: 'Motosiklet', Icon: IconMotorcycle },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [featuredListings, setFeaturedListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [heroCity, setHeroCity] = useState(searchParams.get('city') || '');
  const [heroSearch, setHeroSearch] = useState(searchParams.get('search') || '');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
    status: 'active',
  });

  // URL'deki query parametreleri değiştikçe filtreleri senkronize et
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const q = searchParams.get('search') || '';

    setFilters((prev) => ({
      ...prev,
      category: cat,
      city: city,
      search: q,
    }));
    setHeroCity(city);
    setHeroSearch(q);
  }, [searchParams]);

  // ÖNE ÇIKAN İLANLARI VERİTABANINDAN GETİR
  const fetchFeatured = useCallback(async () => {
    setFeaturedLoading(true);
    try {
      const url = filters.category
        ? `${API_BASE}/listings/featured?category=${encodeURIComponent(filters.category)}`
        : `${API_BASE}/listings/featured`;
      
      const { data } = await axios.get(url);
      if (data.success && Array.isArray(data.data)) {
        setFeaturedListings(data.data);
      } else {
        setFeaturedListings([]);
      }
    } catch {
      setFeaturedListings([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, [filters.category]);

  // GÜNCEL İLANLARI VERİTABANINDAN GETİR
  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.city && filters.city !== 'Tüm Şehirler') params.set('city', filters.city);
      if (filters.search) params.set('search', filters.search);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.status) params.set('status', filters.status);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await axios.get(`${API_BASE}/listings?${params.toString()}`);
      if (data.success && Array.isArray(data.data)) {
        setListings(data.data);
        setTotalPages(data.pages || 1);
        setCurrentPage(page);
      } else {
        setListings([]);
        setTotalPages(1);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeatured();
    fetchListings(1);
  }, [fetchFeatured, fetchListings]);

  // HERO ARAMA FORMU
  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (heroCity && heroCity !== 'Tüm Şehirler') {
      params.set('city', heroCity);
    } else {
      params.delete('city');
    }
    if (heroSearch.trim()) {
      params.set('search', heroSearch.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  // KATEGORİ SEÇİMİ
  const handleCategoryTab = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  // FİLTRELERİ SIFIRLAMA (Tümünü Göster)
  const handleFilterReset = () => {
    setSearchParams(new URLSearchParams());
    setHeroCity('');
    setHeroSearch('');
    setFilters({
      category: '',
      city: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt',
      status: 'active',
    });
  };

  const activeCategory = filters.category;
  const activeCity = filters.city;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      
      {/* ===== HERO ALANI (SAF SİYAH & TURUNCU KONSEPTİ - MAVİ KALDIRILDI) ===== */}
      <section className="relative bg-gradient-to-b from-[#090b0e] via-[#101318] to-[#15181f] py-14 px-4 overflow-hidden border-b border-neutral-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Kurumsal Rozet */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181a20] border border-neutral-750 text-amber-400 text-xs font-bold tracking-wide uppercase shadow-sm">
              <IconShield size={14} color="#f59e0b" />
              Türkiye Yerel Esnaf ve İş Gücü Platformu
            </span>
          </div>

          {/* Başlık ve Açıklama */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3">
              Şehrindeki Güvenilir <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Esnafı ve İşi</span> Hemen Bul
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal">
              Doğrudan kullanıcılar ve esnaflar tarafından yayınlanan gerçek ilanlar. Komisyonsuz, doğrudan yerel iletişim.
            </p>
          </div>

          {/* Arama Formu */}
          <form
            onSubmit={handleHeroSearch}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex flex-col md:flex-row gap-2.5 shadow-2xl border border-slate-200/50"
            id="hero-search-form"
          >
            {/* Şehir Seçici */}
            <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition-all">
              <IconPin size={18} color="#d97706" className="flex-shrink-0 mr-2" />
              <select
                value={heroCity}
                onChange={(e) => setHeroCity(e.target.value)}
                className="w-full py-3 bg-transparent text-slate-800 text-sm font-semibold focus:outline-none cursor-pointer"
                id="hero-city-select"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c === 'Tüm Şehirler' ? '' : c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Arama Metni */}
            <div className="flex-[2] flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition-all">
              <IconSearch size={18} color="#64748b" className="flex-shrink-0 mr-2" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Örn: Oto tamir ustası, aşçı, devren dükkan..."
                className="w-full py-3 bg-transparent text-slate-900 text-sm font-medium focus:outline-none placeholder:text-slate-400"
                id="hero-search-input"
              />
            </div>

            {/* Arama Butonu */}
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-sm"
              id="hero-search-btn"
            >
              <IconSearch size={18} color="#0f172a" />
              <span>İlanları Bul</span>
            </button>
          </form>

          {/* KATEGORİ TABLARI */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {CATEGORY_TABS.map(({ label, value, Icon }) => {
              const isActive = activeCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryTab(value)}
                  id={`hero-tab-${value ? value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'all'}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 ring-2 ring-amber-300 scale-105'
                      : 'bg-[#181a20] text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-750'
                  }`}
                >
                  {Icon && <Icon size={14} color={isActive ? '#0f172a' : '#f59e0b'} />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GÜVEN & BİLGİLENDİRME BARI ===== */}
      <div className="bg-white border-b border-slate-200 shadow-sm py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <IconStore size={20} color="#d97706" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">Gerçek Esnaf & Kullanıcı İlanları</div>
              <div className="text-xs text-slate-500">Sadece platform kullanıcılarının yayınladığı güncel ilanlar</div>
            </div>
          </div>

          <Link
            to="/ilan-ver"
            className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1.5 bg-slate-100 hover:bg-amber-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all ml-auto"
          >
            <IconPlus size={14} color="#d97706" />
            Yeni İlan Oluştur
          </Link>
        </div>
      </div>

      {/* ===== AKTİF FİLTRE BİLGİSİ ===== */}
      {(activeCategory || activeCity || filters.search) && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-900">Aktif Filtreler:</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-sm">
                  {activeCategory}
                  <button onClick={() => handleCategoryTab('')} className="hover:opacity-75 cursor-pointer">
                    <IconClose size={12} color="#0f172a" />
                  </button>
                </span>
              )}
              {activeCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-white font-bold text-xs">
                  {activeCity}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('city');
                      setSearchParams(params);
                    }}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <IconClose size={12} color="#fff" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-300 text-slate-800 font-semibold text-xs">
                  "{filters.search}"
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('search');
                      setSearchParams(params);
                    }}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <IconClose size={12} color="#475569" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleFilterReset}
              className="text-xs font-bold text-slate-700 hover:text-red-600 underline cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* ===== ANA İÇERİK: SOLDA SABİT ŞIK SİDEBAR & SAĞDA İLANLAR ===== */}
      <main className="w-full max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          
          {/* TAM SOL TARAFTA HİZALANMIŞ ULTRA ŞIK SİDEBAR */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-24">
            <FilterSidebar
              filters={filters}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                const params = new URLSearchParams();
                if (newFilters.category) params.set('category', newFilters.category);
                if (newFilters.city) params.set('city', newFilters.city);
                if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
                if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
                if (newFilters.sort) params.set('sort', newFilters.sort);
                if (newFilters.status && newFilters.status !== 'active') params.set('status', newFilters.status);
                setSearchParams(params);
              }}
              onReset={handleFilterReset}
            />
          </div>

          {/* SAĞ İÇERİK ALANI (ÖNE ÇIKANLAR + TÜM İLANLAR) */}
          <div className="flex-1 min-w-0 w-full space-y-10">
            
            {/* ===== 1. ÖNE ÇIKAN İLANLAR BÖLÜMÜ (Varsa) ===== */}
            {featuredListings.length > 0 && (
              <section id="featured-listings-section" className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-2xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5 border-b border-amber-200/60 pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <IconStar size={20} color="#f59e0b" />
                      {activeCategory ? `Öne Çıkan ${activeCategory} İlanları` : 'Öne Çıkan Vitrin İlanları'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Öncelikli ve vitrine taşınmış doğrulanmış işletme ve ilanlar
                    </p>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs">
                    Vitrin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {featuredListings.map((listing, i) => (
                    <ListingCard key={listing._id || i} listing={listing} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* ===== 2. TÜM GÜNCEL İLANLAR BÖLÜMÜ ===== */}
            <section id="all-listings-section">
              <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <IconFilter size={20} color="#0f172a" />
                    {activeCategory ? `${activeCategory} İlanları` : 'Tüm Güncel İlanlar'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Doğrulanmış kullanıcı ve esnaf ilanları
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-3 py-1.5 rounded-xl">
                  {listings.length} ilan
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing, i) => (
                    <ListingCard key={listing._id || i} listing={listing} index={i} />
                  ))}
                </div>
              ) : (
                /* GERÇEK VERİ BOŞ DURUMU */
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
                    <IconBriefcase size={28} color="#d97706" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {activeCategory ? `Henüz "${activeCategory}" İlanı Bulunmuyor` : 'Henüz İlan Eklenmemiş'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto mb-6 leading-relaxed">
                    Sistemde sadece gerçek kullanıcı ilanları listelenmektedir. Bu kategoriye ilk ilanı siz ekleyerek bölgenizdeki müşterilere ulaşın!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      to="/ilan-ver"
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm px-6 py-3 rounded-xl font-black inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <IconPlus size={16} color="#0f172a" />
                      İlk İlanı Siz Verin
                    </Link>
                    {activeCategory && (
                      <button
                        onClick={() => handleCategoryTab('')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-3 rounded-xl font-bold cursor-pointer transition-all"
                      >
                        Tüm İlanları Gör
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      {/* ===== HIZLI İLAN VER ÇAĞRISI (SAF SİYAH & TURUNCU - MAVİ KALDIRILDI) ===== */}
      <section className="bg-[#0c0d10] border-t border-neutral-800 py-12 px-4 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Doğrudan İletişim</span>
            <h3 className="text-2xl sm:text-3xl font-black">Sen de Esnaf mısın ya da İş mi Arıyorsun?</h3>
            <p className="text-neutral-300 text-sm mt-1 max-w-xl">
              İlanını hemen ücretsiz oluştur. Komisyon veya aracı yok; doğrudan telefon ve yerel ağ üzerinden ulaşsınlar.
            </p>
          </div>
          <Link
            to="/ilan-ver"
            className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm flex items-center gap-2 cursor-pointer"
          >
            <IconPlus size={18} color="#0f172a" />
            <span>Ücretsiz İlan Yayınla</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
