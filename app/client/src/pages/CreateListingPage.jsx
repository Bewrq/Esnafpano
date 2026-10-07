import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import {
  IconWarning, IconSpinner, IconPin, IconEdit, IconCamera,
  IconPhone, IconWhatsApp, IconCheck, IconCelebrate, IconInfo,
  IconBriefcase, IconStore, IconWrench, IconPlus, IconClose,
  IconCar, IconMotorcycle, IconShield, IconBuildingStore, IconClock, IconGlobe, IconTools, IconCoffee,
  IconUser,
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

const CATEGORY_ICONS = {
  'Dükkan & İşletme Tanıtımı': IconBuildingStore,
  'Kafe & Restoran': IconCoffee,
  'Oto Sanayi & Araç Bakım': IconTools,
  'Hizmet/Ustalık': IconWrench,
  'İş Arıyorum': IconBriefcase,
  'Eleman Aranıyor': IconBriefcase,
  'Dükkan Devir/Kiralama': IconStore,
  'Vasıta & Araç': IconCar,
  'Motosiklet': IconMotorcycle,
};

const BUSINESS_SECTOR_DATA = {
  'Oto Sanayi & Tamir / Servis': {
    Icon: IconTools,
    defaultFeatures: [
      'Akü Satış & Değişimi', 'Oto Elektrik & Beyin Testi', 'Mekanik & Motor Bakımı',
      'Kaporta & Fırın Boya', 'Fren & Balata', 'Yağ & Filtre Değişimi',
      'Lastik & Rot Balans', 'Klima Gazı & Kaçak Tespiti', 'Yedek Parça Satışı',
      'Binek Araç', 'Ticari Araç / Kamyonet', 'Ağır Vasıta', 'Motosiklet Bakımı', '7/24 Acil Yol Yardım',
    ],
  },
  'Kafe, Restoran & Lokanta': {
    Icon: IconCoffee,
    defaultFeatures: [
      'Paket Servis', 'Gel-Al Hizmeti', 'Açık Alan / Bahçe', 'Kahvaltı & Serpme',
      'Dünya Mutfağı', 'Fast Food & Izgara', 'Tatlı & Nitelikli Kahve',
      'Çocuk Oyun Alanı', 'Wi-Fi & Çalışma Alanı', 'Otopark / Vale', 'Masa Rezervasyonu', 'Canlı Müzik',
    ],
  },
  'Hırdavat, Nalbur & Yapı Market': {
    Icon: IconWrench,
    defaultFeatures: [
      'El Aletleri & Matkap/Hilti', 'Boya, Tiner & İzolasyon', 'Akü & Elektrik Tesisatı',
      'Sıhhi & Su Tesisat Parçaları', 'Civata, Somun & Vida Çeşitleri', 'İnşaat / Yapı Kimyasalları',
      'Bahçe & Tarım Aletleri', 'Toptan & Perakende Satış', 'Şantiye & Adrese Teslimat',
    ],
  },
  'Berber, Kuaför & Güzellik Salonu': {
    Icon: IconUser,
    defaultFeatures: [
      'Trend Saç Kesim', 'Sakal Tıraşı & Tasarım', 'Saç Boyama & Röfle',
      'Cilt & Keratin Bakımı', 'Manikür & Pedikür', 'Gelin / Damat Başı', 'Lazer & Ağda', 'Randevulu Hizmet',
    ],
  },
  'Perakende, Mağaza & Butik': {
    Icon: IconStore,
    defaultFeatures: [
      'Giyim & Moda', 'Ayakkabı & Çanta', 'Elektronik & Telefon Aksesuar',
      'Ev Tekstili & Züccaciye', 'Toptan Satış', 'Perakende Satış', 'Taksit & Kredi Kartı', 'Adrese Teslim',
    ],
  },
  'Diğer Esnaf, Atölye & Hizmet': {
    Icon: IconBuildingStore,
    defaultFeatures: [
      'Özel Sipariş & İmalat', 'Montaj & Kurulum', 'Garantili İşçilik', 'Yerinde Keşif', 'Toptan & Perakende',
    ],
  },
};

const CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya',
  'Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik',
  'Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum',
  'Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir',
  'Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul',
  'İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis',
  'Kırıkkale','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa',
  'Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize',
  'Sakarya','Samsun','Şanlıurfa','Siirt','Sinop','Şırnak','Sivas','Tekirdağ',
  'Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
];

const STEPS = [
  { id: 1, label: 'Kategori & Konum', Icon: IconPin },
  { id: 2, label: 'İşletme Detayları', Icon: IconEdit },
  { id: 3, label: 'Fotoğraf Yükle', Icon: IconCamera },
  { id: 4, label: 'İletişim', Icon: IconPhone },
];

const INITIAL_FORM = {
  category: '',
  businessType: 'Oto Sanayi & Tamir / Servis',
  businessFeatures: [],
  workingHours: '',
  websiteOrSocial: '',
  city: '',
  district: '',
  address: '',
  title: '',
  description: '',
  price: '',
  priceLabel: '',
  images: [],
  contactPhone: '',
  whatsappLink: '',
};

export default function CreateListingPage() {
  const { user, token, saveSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // Giriş yapmamış kullanıcıyı doğrudan giriş yapma sayfasına yönlendir
  useEffect(() => {
    if (!user) {
      navigate('/giris');
    }
  }, [user, navigate]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleFeature = (tag) => {
    const current = form.businessFeatures || [];
    if (current.includes(tag)) {
      update('businessFeatures', current.filter((t) => t !== tag));
    } else {
      update('businessFeatures', [...current, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!customTagInput.trim()) return;
      if (!form.businessFeatures.includes(customTagInput.trim())) {
        update('businessFeatures', [...form.businessFeatures, customTagInput.trim()]);
      }
      setCustomTagInput('');
    }
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.category) { setError('Lütfen bir kategori seçin'); return false; }
      if (!form.city) { setError('Lütfen şehir seçin'); return false; }
      if (!form.district.trim()) { setError('Lütfen ilçe girin'); return false; }
    }
    if (step === 2) {
      if (form.title.trim().length < 4) { setError('Lütfen geçerli bir başlık / işletme adı girin (en az 4 karakter)'); return false; }
      if (form.description.trim().length < 10) { setError('Lütfen açıklama alanını doldurun (en az 10 karakter)'); return false; }
    }
    // Telefon numarası artık opsiyoneldir (zorunlu değildir)
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        images: (form.images || []).filter(Boolean),
        whatsappLink: form.whatsappLink || (form.contactPhone ? `https://wa.me/90${form.contactPhone.replace(/\D/g, '').slice(-10)}` : ''),
      };
      const { data } = await axios.post(`${API_BASE}/listings`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (data.success) {
        if (data.token && saveSession) {
          saveSession(data.token, data.user);
        }
        setSuccess(true);
        setTimeout(() => {
          if (data.data?._id) {
            navigate(`/ilan/${data.data._id}`);
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('İlan verme hatası:', err);
      setError(err.response?.data?.message || 'İlan oluşturulurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-10 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <IconCelebrate size={64} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">İlan Yayında!</h2>
          <p className="text-gray-500 mb-6">İlanınız başarıyla oluşturuldu. Yönlendiriliyorsunuz...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-amber-400 h-2 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            İlan <span className="text-amber-500">Ver</span>
          </h1>
          <p className="text-gray-500">Ücretsiz ilan oluşturun, binlerce kişiye ulaşın</p>
        </div>

        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between flex-wrap gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <IconShield size={20} color="#d97706" />
              <div>
                <div className="text-xs font-bold text-amber-950">Giriş Yapmanız Önerilir</div>
                <div className="text-[11px] text-amber-800">İlanınızı daha sonra düzenlemek veya satıldı olarak işaretlemek için hesabınızla giriş yapın.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/giris" className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-xl hover:bg-slate-800">
                Giriş Yap
              </Link>
              <Link to="/kayit" className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl hover:bg-amber-500">
                Kayıt Ol
              </Link>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          {STEPS.map(({ id, label, Icon }) => (
            <div key={id} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step > id
                    ? 'bg-amber-400 border-amber-400'
                    : step === id
                    ? 'bg-white border-amber-400 shadow-lg scale-110'
                    : 'bg-white border-gray-200'
                }`}
              >
                {step > id
                  ? <IconCheck size={16} color="#000" />
                  : <Icon size={16} color={step === id ? '#d97706' : '#9ca3af'} />
                }
              </div>
              <span className={`text-xs mt-2 font-medium hidden sm:block ${step >= id ? 'text-amber-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm flex items-center gap-2">
              <IconWarning size={18} color="#ef4444" />
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconPin size={20} color="#f59e0b" />
                Kategori &amp; Konum Bilgileri
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  İlan Kategorisi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = CATEGORY_ICONS[cat];
                    return (
                      <button
                        key={cat} type="button"
                        onClick={() => update('category', cat)}
                        className={`text-left px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                          form.category === cat
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-gray-200 hover:border-amber-300 text-gray-700 hover:bg-amber-50/50'
                        }`}
                        id={`category-btn-${cat.replace(/[\s/]/g, '-')}`}
                      >
                        <span className="flex items-center gap-2 font-medium text-sm">
                          <CatIcon size={16} color={form.category === cat ? '#d97706' : '#6b7280'} />
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şehir (İl) <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="input-field"
                  id="create-city-select"
                >
                  <option value="">Şehir seçin...</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İlçe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  placeholder="Örn: Merkez, Kadıköy, Çankaya..."
                  className="input-field"
                  id="create-district-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adres / Mahalle (Opsiyonel)</label>
                <input
                  type="text" value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  placeholder="Örn: Alâeddin Mahallesi, Cumhuriyet Cad..."
                  className="input-field"
                  id="create-address-input"
                />
              </div>

              {/* Harita Önizlemesi */}
              {form.city && form.district && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm animate-fade-in">
                  <div className="px-3 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1.5 font-bold">
                      <IconPin size={14} color="#d97706" />
                      Canlı Harita: {form.district}, {form.city} {form.address ? `(${form.address})` : ''}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Otomatik Konumlandı
                    </span>
                  </div>
                  <div className="h-44 w-full bg-slate-100">
                    <iframe
                      title="Konum Önizleme"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${form.address ? form.address + ' ' : ''}${form.district} ${form.city} Türkiye`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {form.category === 'Dükkan & İşletme Tanıtımı' ? (
                <>
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <IconBuildingStore size={22} color="#d97706" />
                      İşletme &amp; Dükkan Tanıtım Detayları
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Müşterilerinizin sizi kolayca bulması için sektörünüzü, sunduğunuz hizmetleri ve çalışma saatlerinizi belirtin.
                    </p>
                  </div>

                  {/* Sektör Seçimi */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      İşletme Sektörü <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {Object.keys(BUSINESS_SECTOR_DATA).map((sectorKey) => {
                        const SectorIcon = BUSINESS_SECTOR_DATA[sectorKey].Icon;
                        const isSelected = form.businessType === sectorKey;
                        return (
                          <button
                            key={sectorKey}
                            type="button"
                            onClick={() => {
                              update('businessType', sectorKey);
                              // Sektör değiştiğinde varsayılan özellikleri seçilebilir yap
                            }}
                            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 ${
                              isSelected
                                ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-bold shadow-sm'
                                : 'border-gray-200 hover:border-amber-200 text-gray-700 bg-white'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-gray-100 text-gray-600'}`}>
                              <SectorIcon size={16} color="currentColor" />
                            </div>
                            <span className="text-xs font-semibold leading-tight">{sectorKey}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dükkan / İşletme Adı */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      İşletme / Dükkan Ünvanı (Başlık) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => update('title', e.target.value)}
                      placeholder={
                        form.businessType.includes('Sanayi')
                          ? 'Örn: Yıldız Oto Sanayi - Bosch Car Fren & Mekanik Servisi'
                          : form.businessType.includes('Kafe')
                          ? 'Örn: Moda Kahvecisi & Bahçe Bistro'
                          : form.businessType.includes('Hırdavat')
                          ? 'Örn: Çelikler Yapı Market & Nalbur - Akü, Tesisat & Hırdavat'
                          : 'Örn: Dükkan & İşletme Ünvanınız'
                      }
                      className="input-field font-semibold"
                      maxLength={100}
                      id="create-title-input"
                    />
                  </div>

                  {/* Sektöre Özel Hizmetler & Ürünler (Etiketler) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Sunduğunuz Hizmetler &amp; Satılan Malzemeler
                      </label>
                      <span className="text-[11px] text-gray-400 font-medium">Tıklayarak seçin / çıkarın</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(BUSINESS_SECTOR_DATA[form.businessType]?.defaultFeatures || []).map((feat) => {
                          const isChecked = (form.businessFeatures || []).includes(feat);
                          return (
                            <button
                              key={feat}
                              type="button"
                              onClick={() => toggleFeature(feat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-400/30'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
                              }`}
                            >
                              {isChecked ? <IconCheck size={12} color="#0f172a" /> : <IconPlus size={12} color="#94a3b8" />}
                              <span>{feat}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Özel Etiket Ekleme */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={handleAddCustomTag}
                          placeholder="Listede olmayan bir hizmet veya malzeme yazıp Enter'a basın..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customTagInput.trim()) return;
                            if (!form.businessFeatures.includes(customTagInput.trim())) {
                              update('businessFeatures', [...form.businessFeatures, customTagInput.trim()]);
                            }
                            setCustomTagInput('');
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
                        >
                          Ekle
                        </button>
                      </div>

                      {/* Seçilen Etiketlerin Özeti */}
                      {(form.businessFeatures || []).length > 0 && (
                        <div className="text-[11px] text-slate-500 pt-1">
                          <span className="font-bold text-slate-700">Seçilen Özellikler ({form.businessFeatures.length}):</span>{' '}
                          {form.businessFeatures.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Çalışma Saatleri & Sosyal Medya */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <IconClock size={14} color="#d97706" />
                        Çalışma Gün &amp; Saatleri
                      </label>
                      <input
                        type="text"
                        value={form.workingHours}
                        onChange={(e) => update('workingHours', e.target.value)}
                        placeholder="Örn: Hafta içi: 08:30 - 19:00 | Pazar Kapalı"
                        className="input-field text-xs"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['08:30 - 19:00 (Pazar Kapalı)', 'Hergün 08:00 - 23:00', '7/24 Açık / Kesintisiz'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => update('workingHours', preset)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-600 font-medium transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <IconGlobe size={14} color="#d97706" />
                        Instagram / Web Sitesi (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={form.websiteOrSocial}
                        onChange={(e) => update('websiteOrSocial', e.target.value)}
                        placeholder="Örn: instagram.com/isletmeadi veya web sitesi"
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  {/* Detaylı Dükkan Tanıtım Açıklaması */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      İşletme / Dükkan Detaylı Tanıtım Yazısı <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="Dükkanınızın geçmişi, baktığınız araç veya ürün modelleri, orijinal yedek parça garantiniz, müşteri bekleme salonu, ödeme kolaylıkları vb. detayları yazın..."
                      className="input-field resize-none text-sm"
                      rows={6}
                      maxLength={2000}
                      id="create-description-textarea"
                    />
                    <span className="text-xs text-gray-400 mt-1 block text-right">{form.description.length}/2000</span>
                  </div>

                  {/* Fiyat / Kampanya Bilgisi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Kampanya &amp; Fiyat Bilgisi (Opsiyonel)
                      </label>
                      <input
                        type="text"
                        value={form.priceLabel}
                        onChange={(e) => update('priceLabel', e.target.value)}
                        placeholder="Örn: Ücretsiz Arıza Tespiti, Uygun Fiyat, %15 İndirim..."
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Başlangıç Fiyatı (₺ - Varsa)
                      </label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => update('price', e.target.value)}
                        placeholder="Örn: 250"
                        className="input-field text-xs"
                        min="0"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* STANDART İLAN FORMU */
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <IconEdit size={20} color="#f59e0b" />
                    Başlık &amp; Açıklama
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      İlan Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => update('title', e.target.value)}
                      placeholder="Dikkat çekici bir başlık yazın..."
                      className="input-field"
                      maxLength={100}
                      id="create-title-input"
                    />
                    <span className="text-xs text-gray-400 mt-1 block text-right">{form.title.length}/100</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Açıklama <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      placeholder="İlanınızı detaylı açıklayın. Çalışma şartları, avantajlar, özellikler..."
                      className="input-field resize-none"
                      rows={8}
                      maxLength={2000}
                      id="create-description-textarea"
                    />
                    <span className="text-xs text-gray-400 mt-1 block text-right">{form.description.length}/2000</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fiyat / Maaş (₺)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => update('price', e.target.value)}
                        placeholder="Örn: 22000"
                        className="input-field"
                        min="0"
                        id="create-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fiyat Etiketi</label>
                      <input
                        type="text"
                        value={form.priceLabel}
                        onChange={(e) => update('priceLabel', e.target.value)}
                        placeholder="Örn: 22.000 ₺/ay, Pazarlıklı"
                        className="input-field"
                        id="create-price-label-input"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <IconCamera size={20} color="#f59e0b" />
                  Fotoğraf Yükle
                </h2>
                <p className="text-sm text-gray-500">
                  Telefonunuzdan veya bilgisayarınızdan kolayca fotoğraf seçip yükleyebilirsiniz.
                </p>
              </div>

              <ImageUploader
                images={form.images || []}
                onChange={(imgs) => update('images', imgs)}
                maxImages={8}
              />

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2 text-xs font-semibold text-amber-900">
                <IconInfo size={16} color="#d97706" className="flex-shrink-0 mt-0.5" />
                Fotoğraflı ilanlar ortalama 4 kat daha fazla incelenir ve hızlı alıcı bulur!
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconPhone size={20} color="#f59e0b" />
                İletişim Bilgileri
              </h2>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    İletişim Telefonu <span className="text-xs text-amber-600 font-normal">(Opsiyonel)</span>
                  </label>
                  <span className="text-xs text-gray-400">Zorunlu değildir</span>
                </div>
                <input
                  type="tel" value={form.contactPhone}
                  onChange={(e) => update('contactPhone', e.target.value)}
                  placeholder="05XX XXX XX XX (İsteğe bağlı)" className="input-field"
                  id="create-phone-input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Numara girmek istemiyorsanız boş bırakabilirsiniz. Müşterileriniz sizinle site içi mesaj kutusundan ve soru-cevap modülünden iletişime geçebilir.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Linki (Opsiyonel)</label>
                <input
                  type="url" value={form.whatsappLink}
                  onChange={(e) => update('whatsappLink', e.target.value)}
                  placeholder="https://wa.me/905XXXXXXXXX" className="input-field"
                  id="create-whatsapp-input"
                />
                <p className="text-xs text-gray-400 mt-1">Boş bırakırsanız telefon numarasından otomatik oluşturulur</p>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">İlan Özeti</h3>
                <div className="text-sm space-y-1.5">
                  <div className="flex gap-2"><span className="text-gray-500 w-20">Kategori:</span> <span className="font-medium">{form.category}</span></div>
                  <div className="flex gap-2"><span className="text-gray-500 w-20">Konum:</span> <span className="font-medium">{form.district}, {form.city}</span></div>
                  <div className="flex gap-2"><span className="text-gray-500 w-20">Başlık:</span> <span className="font-medium line-clamp-1">{form.title}</span></div>
                  {form.price && <div className="flex gap-2"><span className="text-gray-500 w-20">Fiyat:</span> <span className="font-medium text-amber-600">{Number(form.price).toLocaleString('tr-TR')} ₺</span></div>}
                  <div className="flex gap-2"><span className="text-gray-500 w-20">Görseller:</span> <span className="font-medium">{form.images.filter(Boolean).length} adet</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
            {step > 1 && (
              <button
                type="button" onClick={prevStep}
                className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-gray-400 font-semibold py-3.5 rounded-xl transition-all duration-200"
                id="prev-step-btn"
              >
                Geri
              </button>
            )}

            {step < STEPS.length ? (
              <button
                type="button" onClick={nextStep}
                className="flex-1 btn-primary py-3.5 text-base flex items-center justify-center gap-2"
                id="next-step-btn"
              >
                Devam Et
              </button>
            ) : (
              <button
                type="button" onClick={handleSubmit} disabled={loading}
                className="flex-[2] bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-4 rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                id="publish-listing-btn"
              >
                {loading ? (
                  <><IconSpinner size={22} color="#000" /> Yayınlanıyor...</>
                ) : (
                  'Ilanı Yayınla'
                )}
              </button>
            )}
          </div>
        </div>

        {!user && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
            <IconInfo size={16} color="#d97706" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              İlanınızı yönetmek için{' '}
              <a href="/giris" className="font-bold underline">giriş yapın</a>{' '}
              veya{' '}
              <a href="/kayit" className="font-bold underline">kayıt olun</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
