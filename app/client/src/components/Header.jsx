import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconSearch, IconPin, IconPlus, IconMenu, IconHome,
  IconBriefcase, IconStore, IconWrench, IconStar, IconClose,
  IconUser, IconLogout, IconChevronDown, IconShield,
  IconCar, IconMotorcycle, IconBuildingStore, IconCoffee, IconTools,
} from './Icons';

const CITIES = [
  'Tüm Türkiye', 'Adana', 'Ankara', 'Antalya', 'Bursa', 'Çanakkale', 'Eskişehir',
  'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Kocaeli', 'Konya', 'Mersin', 'Samsun', 'Trabzon',
];

const CATEGORIES = [
  { value: '', label: 'Tüm Kategoriler', short: 'Tümü', Icon: IconHome },
  { value: 'Dükkan & İşletme Tanıtımı', label: 'Dükkan & İşletme Rehberi', short: 'Dükkan & İşletme', Icon: IconBuildingStore },
  { value: 'Kafe & Restoran', label: 'Kafe, Restoran & Yeme-İçme', short: 'Kafe & Restoran', Icon: IconCoffee },
  { value: 'Oto Sanayi & Araç Bakım', label: 'Oto Sanayi & Araç Bakım', short: 'Sanayi & Bakım', Icon: IconTools },
  { value: 'İş Arıyorum', label: 'İş Arıyorum', short: 'İş Arıyorum', Icon: IconBriefcase },
  { value: 'Eleman Aranıyor', label: 'Eleman Aranıyor', short: 'Eleman Aranıyor', Icon: IconBriefcase },
  { value: 'Dükkan Devir/Kiralama', label: 'Dükkan Devir & Kiralama', short: 'Dükkan Devir', Icon: IconStore },
  { value: 'Hizmet/Ustalık', label: 'Hizmet & Ustalık', short: 'Hizmet / Usta', Icon: IconWrench },
  { value: 'Vasıta & Araç', label: 'Vasıta & Araç Satışı', short: 'Vasıta & Araç', Icon: IconCar },
  { value: 'Motosiklet', label: 'Motosiklet Satışı', short: 'Motosiklet', Icon: IconMotorcycle },
];

export default function Header({ onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentCity = searchParams.get('city') || '';

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // URL değiştikçe arama parametrelerini güncelle
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedCity(searchParams.get('city') || '');
  }, [searchParams]);

  // Dropdown dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'Tüm Türkiye') params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);

    if (onSearch) {
      onSearch({
        search: searchQuery.trim(),
        city: selectedCity === 'Tüm Türkiye' ? '' : selectedCity,
        category: selectedCategory,
      });
    }
    navigate(`/?${params.toString()}`);
  };

  const handleCategoryClick = (catValue) => {
    const params = new URLSearchParams(searchParams);
    if (catValue) {
      params.set('category', catValue);
    } else {
      params.delete('category');
    }
    params.delete('page');
    navigate(`/?${params.toString()}`);
  };

  // Kullanıcı adı baş harfleri
  const getUserInitials = (name) => {
    if (!name || typeof name !== 'string') return 'EP';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'EP';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = user?.name || user?.email || 'Kullanıcı';
  const firstName = displayName.split(' ')[0];
  const displayRole = user?.role === 'esnaf' ? 'Esnaf' : 'Üye';

  return (
    <header className="sticky top-0 z-50 shadow-lg bg-[#0c0d10] border-b border-neutral-800 text-white select-none">
      {/* ===== ÜST KURUMSAL BİLGİ & ARAMA ÇUBUĞU ===== */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-5">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <IconStore size={22} color="#0c0d10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">
                Esnaf<span className="text-amber-400">Pano</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase mt-0.5">
                Yerel İş & Hizmet Ağı
              </span>
            </div>
          </Link>

          {/* ŞEHİR SEÇİMİ (Masaüstü) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#18191d] hover:bg-[#202227] border border-neutral-750 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer">
            <IconPin size={16} color="#f59e0b" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider leading-none">Konum</div>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value && e.target.value !== 'Tüm Türkiye') {
                    params.set('city', e.target.value);
                  } else {
                    params.delete('city');
                  }
                  navigate(`/?${params.toString()}`);
                }}
                className="bg-transparent text-white font-semibold cursor-pointer focus:outline-none pr-2 text-xs"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#18191d] text-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MERKEZİ GELİŞMİŞ ARAMA KUTUSU */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-amber-400 transition-all">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 text-slate-700 text-xs font-medium px-3.5 py-2.5 border-r border-slate-200 cursor-pointer focus:outline-none hover:bg-slate-200/70 transition-colors max-w-[150px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hangi işi veya ustayı arıyorsunuz? (Örn: Aşçı, boyacı, devir kafe...)"
              className="flex-1 px-4 py-2.5 text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              id="header-search-btn"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-2.5 font-bold flex items-center justify-center transition-all cursor-pointer"
              title="Ara"
            >
              <IconSearch size={18} color="#0f172a" />
            </button>
          </form>

          {/* SAĞ PANEL: HESAP BİLGİSİ & İLAN VER */}
          <div className="flex items-center gap-3">
            {user ? (
              /* GİRİŞ YAPMIŞ KULLANICI */
              <div className="flex items-center gap-2">
                {/* MESAJLARIM BUTONU */}
                <Link
                  to="/mesajlar"
                  id="header-messages-btn"
                  title="Site İçi Mesajlarım"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#18191d] hover:bg-[#22242a] border border-neutral-750 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <span className="text-sm">💬</span>
                  <span className="hidden sm:inline">Mesajlar</span>
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    id="user-profile-menu-button"
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-[#18191d] hover:bg-[#22242a] border border-neutral-750 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        getUserInitials(displayName)
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                        {firstName}
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-semibold">
                          {displayRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400 leading-tight truncate max-w-[110px]">
                        Hesabım &amp; İlanlarım
                      </div>
                    </div>
                    <IconChevronDown size={14} color="#94a3b8" className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* PROFİL AÇILIR MENÜ (DROPDOWN) */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Kullanıcı Kartı Başlığı */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold text-sm flex items-center justify-center shadow overflow-hidden flex-shrink-0">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              getUserInitials(displayName)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{displayName}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.email || ''}</div>
                            <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <IconShield size={11} color="#d97706" />
                              {user?.role === 'esnaf' ? 'Onaylı Esnaf Hesabı' : 'Üye'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menü Seçenekleri */}
                      <div className="py-1">
                        <Link
                          to="/mesajlar"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-800 hover:bg-slate-100 transition-colors font-bold"
                        >
                          <span className="text-sm">💬</span>
                          Site İçi Mesajlarım
                        </Link>

                        <Link
                          to="/ilanlarim"
                          onClick={() => setUserDropdownOpen(false)}
                          id="header-my-listings-link"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-800 hover:bg-slate-100 transition-colors font-bold"
                        >
                          <IconStore size={16} color="#d97706" />
                          İlanlarım &amp; İlan Yönetimi
                        </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          id="header-dropdown-admin-link"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors font-black border-y border-red-100"
                        >
                          <IconShield size={16} color="#dc2626" />
                          🛡️ Admin Dashboard
                        </Link>
                      )}

                      {(user?._id || user?.id) && (
                        <Link
                          to={`/magaza/${user._id || user.id}`}
                          onClick={() => setUserDropdownOpen(false)}
                          id="header-my-store-link"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors font-bold"
                        >
                          <IconBuildingStore size={16} color="#d97706" />
                          Mağazamı Görüntüle
                        </Link>
                      )}

                      <Link
                        to="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 transition-colors font-medium"
                      >
                        <IconHome size={16} color="#64748b" />
                        Tüm İlanlara Dön
                      </Link>

                      <Link
                        to="/ilan-ver"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors font-semibold"
                      >
                        <IconPlus size={16} color="#d97706" />
                        Yeni İlan Oluştur
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        id="user-logout-button"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer"
                      >
                        <IconLogout size={16} color="#dc2626" />
                        Oturumu Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
              /* GİRİŞ YAPILMAMIŞSA */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/giris"
                  id="header-login-link"
                  className="text-xs font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <IconUser size={15} color="#94a3b8" />
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  id="header-register-link"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* ADMİN DASHBOARD BUTONU (Sadece Admin Hesabına Özel) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                id="header-admin-dashboard-btn"
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:brightness-110 text-white font-black text-xs md:text-sm px-3.5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all whitespace-nowrap cursor-pointer ring-2 ring-amber-400/40"
              >
                <IconShield size={16} color="#fff" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* İLAN VER BUTONU (Giriş yapılmamışsa doğrudan giriş sayfasına yönlendirir) */}
            <Link
              to={user ? "/ilan-ver" : "/giris"}
              id="header-post-listing-btn"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              <IconPlus size={16} color="#0f172a" />
              <span>İlan Ver</span>
            </Link>

            {/* MOBİL MENÜ TOGGLE */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/60 border border-slate-700"
              id="mobile-menu-btn"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <IconClose size={20} color="#fff" /> : <IconMenu size={20} color="#fff" />}
            </button>
          </div>
        </div>

        {/* MOBİL ARAMA KUTUSU */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden border border-slate-300">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İş, usta veya ilan ara..."
              className="flex-1 px-3 py-2 text-slate-900 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-amber-400 text-slate-950 px-4 font-bold flex items-center justify-center">
              <IconSearch size={18} color="#000" />
            </button>
          </form>
        </div>
      </div>

      {/* ===== ALT KATEGORİ NAVİGASYON BARI (RESMİ, ŞIK, ANLIK TIKLANABİLİR) ===== */}
      <nav className="bg-[#121316] border-t border-neutral-800 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 py-1.5">
          {CATEGORIES.map(({ value, short, Icon }) => {
            const isActive = currentCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleCategoryClick(value)}
                id={`nav-category-${value ? value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'all'}`}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon size={14} color={isActive ? '#0f172a' : 'currentColor'} />
                <span>{short}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-neutral-750 mx-1"></div>

          {/* ÖNE ÇIKANLAR LİNKİ */}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('featured', 'true');
              navigate(`/?${params.toString()}`);
            }}
            className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg hover:bg-slate-700/60 transition-colors whitespace-nowrap cursor-pointer ml-auto"
          >
            <IconStar size={13} color="#f59e0b" />
            Öne Çıkan Vitrin
          </button>
        </div>
      </nav>

      {/* ===== MOBİL AÇILIR ÇEKMECE (DRAWER - SAF SİYAH) ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0d10] border-t border-neutral-800 px-4 py-4 space-y-3">
          {user ? (
            <div className="bg-[#18191d] p-3.5 rounded-2xl border border-neutral-750">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center shadow overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials(displayName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{displayName}</div>
                  <div className="text-xs text-neutral-400 truncate">{user?.email || ''}</div>
                  <span className="text-[10px] text-amber-400 font-semibold">{displayRole}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Link
                  to="/mesajlar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-xs text-center font-bold bg-neutral-800 text-white border border-neutral-700 rounded-xl"
                >
                  💬 Mesajlar
                </Link>
                <Link
                  to="/ilanlarim"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-xs text-center font-bold bg-amber-400 text-slate-950 rounded-xl shadow-sm"
                >
                  İlanlarım
                </Link>
                {(user?._id || user?.id) && (
                  <Link
                    to={`/magaza/${user._id || user.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-xs text-center font-bold bg-neutral-800 text-amber-300 border border-neutral-700 rounded-xl"
                  >
                    Mağazam
                  </Link>
                )}
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="mt-2.5 w-full py-2 text-xs text-red-400 font-semibold border border-red-500/30 rounded-xl hover:bg-red-500/10 text-center cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/giris"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold border border-neutral-700"
              >
                Giriş Yap
              </Link>
              <Link
                to="/kayit"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold shadow-sm"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          <div className="border-t border-slate-800 pt-3">
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-2">Kategoriler</div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ value, short, Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    handleCategoryClick(value);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 text-xs text-slate-200 hover:text-white"
                >
                  <Icon size={14} color="#f59e0b" />
                  {short}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
