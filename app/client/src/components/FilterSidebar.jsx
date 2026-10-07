import {
  IconFilter, IconBriefcase, IconStore, IconWrench, IconCar, IconMotorcycle,
  IconBuildingStore, IconCoffee, IconTools, IconClose, IconSearch, IconCheck,
} from './Icons';

const CATEGORIES = [
  { id: '', label: 'Tüm Kategoriler', Icon: IconStore, color: 'text-slate-600', activeBg: 'bg-amber-400 text-slate-950 font-bold' },
  { id: 'Dükkan & İşletme Tanıtımı', label: 'Dükkan & İşletmeler', Icon: IconBuildingStore, color: 'text-amber-600', activeBg: 'bg-amber-500 text-white font-bold' },
  { id: 'Kafe & Restoran', label: 'Kafe, Restoran & Lokanta', Icon: IconCoffee, color: 'text-emerald-600', activeBg: 'bg-emerald-600 text-white font-bold' },
  { id: 'Oto Sanayi & Araç Bakım', label: 'Oto Sanayi & Araç Bakım', Icon: IconTools, color: 'text-blue-600', activeBg: 'bg-blue-600 text-white font-bold' },
  { id: 'Hizmet/Ustalık', label: 'Hizmet & Ustalık', Icon: IconWrench, color: 'text-orange-600', activeBg: 'bg-orange-500 text-white font-bold' },
  { id: 'İş Arıyorum', label: 'İş Arayanlar', Icon: IconBriefcase, color: 'text-indigo-600', activeBg: 'bg-indigo-600 text-white font-bold' },
  { id: 'Eleman Aranıyor', label: 'Eleman Arayanlar', Icon: IconBriefcase, color: 'text-teal-600', activeBg: 'bg-teal-600 text-white font-bold' },
  { id: 'Dükkan Devir/Kiralama', label: 'Dükkan Devir & Kiralama', Icon: IconStore, color: 'text-purple-600', activeBg: 'bg-purple-600 text-white font-bold' },
  { id: 'Vasıta & Araç', label: 'Vasıta & Araç Satışı', Icon: IconCar, color: 'text-rose-600', activeBg: 'bg-rose-600 text-white font-bold' },
  { id: 'Motosiklet', label: 'Motosiklet & Scooter', Icon: IconMotorcycle, color: 'text-cyan-600', activeBg: 'bg-cyan-600 text-white font-bold' },
];

const CITIES = [
  'Tüm Şehirler', 'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl',
  'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır',
  'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
  'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş',
  'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin',
  'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun',
  'Şanlıurfa', 'Siirt', 'Sinop', 'Şırnak', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon',
  'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const handleChange = (key, value) => onFilterChange({ ...filters, [key]: value });
  const handlePriceChange = (key, value) =>
    onFilterChange({ ...filters, [key]: value ? Number(value) : '' });

  const isFiltered = Boolean(
    filters.category ||
    (filters.city && filters.city !== 'Tüm Şehirler') ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.search ||
    (filters.status && filters.status !== 'active')
  );

  return (
    <aside
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 sticky top-24 transition-all"
      id="filter-sidebar"
    >
      {/* Başlık ve Temizle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <IconFilter size={16} color="#d97706" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">Kategori & Filtre</h3>
            <p className="text-[11px] text-slate-500 font-medium">Hızlı sonuç daraltma</p>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            id="filter-reset-btn"
          >
            <IconClose size={11} color="#e11d48" />
            Temizle
          </button>
        )}
      </div>

      {/* KATEGORİLER (Şık Buton / Menü Listesi) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Kategoriler
          </span>
          {filters.category && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              1 Seçili
            </span>
          )}
        </div>

        <div className="space-y-1.5 select-none">
          {CATEGORIES.map(({ id, label, Icon, color, activeBg }) => {
            const isSelected = (!id && !filters.category) || filters.category === id;

            return (
              <button
                key={id || 'all'}
                type="button"
                onClick={() => handleChange('category', id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                  isSelected
                    ? `${activeBg} shadow-sm scale-[1.01]`
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-black/15 text-current'
                        : `bg-slate-100 ${color} group-hover:scale-110`
                    }`}
                  >
                    <Icon size={13} color="currentColor" />
                  </span>
                  <span className="truncate">{label}</span>
                </div>

                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 ml-1">
                    <IconCheck size={10} color="currentColor" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mb-4">
        {/* Şehir Seçimi */}
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Konum (İl)
        </label>
        <div className="relative">
          <select
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value === 'Tüm Şehirler' ? '' : e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 cursor-pointer transition-all shadow-xs"
            id="filter-city-select"
          >
            {CITIES.map((city) => (
              <option key={city} value={city === 'Tüm Şehirler' ? '' : city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div className="border-t border-slate-100 pt-4 mb-4">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Fiyat Aralığı (₺)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="En Az (₺)"
              min="0"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              id="filter-min-price"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="En Çok (₺)"
              min="0"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              id="filter-max-price"
            />
          </div>
        </div>
      </div>

      {/* Sıralama */}
      <div className="border-t border-slate-100 pt-4 mb-4">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Sıralama
        </label>
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-all shadow-xs"
          id="filter-sort-select"
        >
          <option value="-createdAt">En Yeni İlanlar</option>
          <option value="createdAt">En Eski İlanlar</option>
          <option value="price">Fiyat (Düşükten Yükseğe)</option>
          <option value="-price">Fiyat (Yüksekten Düşüğe)</option>
          <option value="-views">En Çok İncelenenler</option>
        </select>
      </div>

      {/* İlan Durumu */}
      <div className="border-t border-slate-100 pt-4">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          İlan Durumu
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleChange('status', 'active')}
            className={`text-xs py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filters.status === 'active' || !filters.status
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Aktif
          </button>
          <button
            type="button"
            onClick={() => handleChange('status', 'all')}
            className={`text-xs py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filters.status === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
            Tümü
          </button>
        </div>
      </div>
    </aside>
  );
}
