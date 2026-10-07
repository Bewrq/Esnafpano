import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconPin, IconCheck, IconClose, IconSpinner } from './Icons';

// Türkiye İllerinin Merkez Koordinatları (Mesafe bazlı en yakın il tespiti için)
const TURKEY_CITY_COORDS = [
  { name: 'Adana', lat: 37.0, lng: 35.3213 },
  { name: 'Adıyaman', lat: 37.7648, lng: 38.2786 },
  { name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567 },
  { name: 'Ağrı', lat: 39.7191, lng: 43.0503 },
  { name: 'Amasya', lat: 40.6533, lng: 35.8331 },
  { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { name: 'Artvin', lat: 41.1828, lng: 41.8183 },
  { name: 'Aydın', lat: 37.856, lng: 27.8416 },
  { name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
  { name: 'Bilecik', lat: 40.1451, lng: 29.9793 },
  { name: 'Bingöl', lat: 38.8853, lng: 40.4983 },
  { name: 'Bitlis', lat: 38.3938, lng: 42.1232 },
  { name: 'Bolu', lat: 40.7392, lng: 31.6089 },
  { name: 'Burdur', lat: 37.7203, lng: 30.2908 },
  { name: 'Bursa', lat: 40.1885, lng: 29.061 },
  { name: 'Çanakkale', lat: 40.1553, lng: 26.4142 },
  { name: 'Çankırı', lat: 40.6013, lng: 33.6134 },
  { name: 'Çorum', lat: 40.5506, lng: 34.9556 },
  { name: 'Denizli', lat: 37.7765, lng: 29.0864 },
  { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
  { name: 'Edirne', lat: 41.6768, lng: 26.5603 },
  { name: 'Elazığ', lat: 38.681, lng: 39.2264 },
  { name: 'Erzincan', lat: 39.75, lng: 39.5 },
  { name: 'Erzurum', lat: 39.9055, lng: 41.2658 },
  { name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
  { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
  { name: 'Giresun', lat: 40.9128, lng: 38.3895 },
  { name: 'Gümüşhane', lat: 40.4603, lng: 39.4817 },
  { name: 'Hakkari', lat: 37.5833, lng: 43.7333 },
  { name: 'Hatay', lat: 36.4018, lng: 36.3498 },
  { name: 'Isparta', lat: 37.7648, lng: 30.5566 },
  { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'İzmir', lat: 38.4237, lng: 27.1428 },
  { name: 'Kars', lat: 40.6013, lng: 43.0975 },
  { name: 'Kastamonu', lat: 41.3887, lng: 33.7827 },
  { name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
  { name: 'Kırklareli', lat: 41.7333, lng: 27.2167 },
  { name: 'Kırşehir', lat: 39.1425, lng: 34.1709 },
  { name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
  { name: 'Konya', lat: 37.8667, lng: 32.4833 },
  { name: 'Kütahya', lat: 39.4167, lng: 29.9833 },
  { name: 'Malatya', lat: 38.3552, lng: 38.3095 },
  { name: 'Manisa', lat: 38.6191, lng: 27.4289 },
  { name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
  { name: 'Mardin', lat: 37.3212, lng: 40.7245 },
  { name: 'Muğla', lat: 37.2153, lng: 28.3636 },
  { name: 'Muş', lat: 38.9462, lng: 41.7539 },
  { name: 'Nevşehir', lat: 38.6244, lng: 34.7144 },
  { name: 'Niğde', lat: 37.9667, lng: 34.6833 },
  { name: 'Ordu', lat: 40.9839, lng: 37.8764 },
  { name: 'Rize', lat: 41.0201, lng: 40.5234 },
  { name: 'Sakarya', lat: 40.7569, lng: 30.3783 },
  { name: 'Samsun', lat: 41.2928, lng: 36.3313 },
  { name: 'Siirt', lat: 37.9333, lng: 41.95 },
  { name: 'Sinop', lat: 42.0231, lng: 35.1531 },
  { name: 'Sivas', lat: 39.7477, lng: 37.0179 },
  { name: 'Tekirdağ', lat: 40.9833, lng: 27.5167 },
  { name: 'Tokat', lat: 40.3167, lng: 36.55 },
  { name: 'Trabzon', lat: 41.0015, lng: 39.7178 },
  { name: 'Tunceli', lat: 39.1079, lng: 39.5401 },
  { name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969 },
  { name: 'Uşak', lat: 38.6823, lng: 29.4082 },
  { name: 'Van', lat: 38.4891, lng: 43.4089 },
  { name: 'Yozgat', lat: 39.8181, lng: 34.8147 },
  { name: 'Zonguldak', lat: 41.4564, lng: 31.7987 },
  { name: 'Aksaray', lat: 38.3687, lng: 34.037 },
  { name: 'Bayburt', lat: 40.2552, lng: 40.2249 },
  { name: 'Karaman', lat: 37.1759, lng: 33.2287 },
  { name: 'Kırıkkale', lat: 39.8468, lng: 33.5153 },
  { name: 'Batman', lat: 37.8812, lng: 41.1293 },
  { name: 'Şırnak', lat: 37.5164, lng: 42.4611 },
  { name: 'Bartın', lat: 41.6344, lng: 32.3375 },
  { name: 'Ardahan', lat: 41.1105, lng: 42.7022 },
  { name: 'Iğdır', lat: 39.9196, lng: 44.0454 },
  { name: 'Yalova', lat: 40.65, lng: 29.2667 },
  { name: 'Karabük', lat: 41.2061, lng: 32.6204 },
  { name: 'Kilis', lat: 36.7184, lng: 37.1212 },
  { name: 'Osmaniye', lat: 37.0742, lng: 36.2478 },
  { name: 'Düzce', lat: 40.8438, lng: 31.1565 },
];

// İki koordinat arasındaki mesafeyi hesaplar (km cinsinden)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LocationDetector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');

  useEffect(() => {
    // Daha önce yanıt vermişse veya konum zaten seçilmişse tekrar sorma
    const dismissed = localStorage.getItem('esnafpano_location_prompt');
    const currentCity = searchParams.get('city');
    if (!dismissed && !currentCity) {
      // 1.5 saniye sonra şıkça ekrana getir
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum algılamayı desteklemiyor.');
      setIsVisible(false);
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // En yakın Türkiye ilini bul
        let nearestCity = 'İstanbul';
        let minDistance = Infinity;

        TURKEY_CITY_COORDS.forEach((city) => {
          const dist = getDistanceKm(latitude, longitude, city.lat, city.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city.name;
          }
        });

        setDetectedCity(nearestCity);
        localStorage.setItem('esnafpano_location_prompt', 'accepted');
        localStorage.setItem('esnafpano_detected_city', nearestCity);

        setTimeout(() => {
          setDetecting(false);
          setIsVisible(false);
          // URL'i güncelle ve ilanları otomatik o şehre filtrele
          const params = new URLSearchParams(searchParams);
          params.set('city', nearestCity);
          navigate(`/?${params.toString()}`);
        }, 800);
      },
      (error) => {
        console.warn('Konum izni verilmedi veya hata oluştu:', error.message);
        setDetecting(false);
        setIsVisible(false);
        localStorage.setItem('esnafpano_location_prompt', 'declined');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('esnafpano_location_prompt', 'dismissed');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-bounce-short">
      <div className="bg-[#12141a] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-neutral-750 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center flex-shrink-0 shadow-md">
              <IconPin size={20} color="#0f172a" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Size En Yakın Esnafı Bulalım</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Konumunuza izin vererek çevrenizdeki dükkanları ve ilanları otomatik görüntüleyin.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <IconClose size={16} color="currentColor" />
          </button>
        </div>

        {detectedCity && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
            <IconCheck size={16} color="#10b981" />
            <span>Konumunuz Algılandı: <strong>{detectedCity}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {detecting ? (
              <>
                <IconSpinner size={15} color="#0f172a" />
                <span>Konum Algılanıyor...</span>
              </>
            ) : (
              <>
                <IconPin size={15} color="#0f172a" />
                <span>Konumu Algıla &amp; Filtrele</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Tüm Türkiye
          </button>
        </div>
      </div>
    </div>
  );
}
