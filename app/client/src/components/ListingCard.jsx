import { Link } from 'react-router-dom';
import {
  IconPin, IconCalendar, IconWhatsApp, IconStar, IconArrowRight, IconShield,
  IconBriefcase, IconStore, IconWrench, IconCar, IconMotorcycle, IconBuildingStore,
} from './Icons';

const CATEGORY_STYLES = {
  'Dükkan & İşletme Tanıtımı': { bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', dot: 'bg-amber-500', Icon: IconBuildingStore },
  'İş Arıyorum': { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', Icon: IconBriefcase },
  'Eleman Aranıyor': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', Icon: IconBriefcase },
  'Dükkan Devir/Kiralama': { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', Icon: IconStore },
  'Hizmet/Ustalık': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', Icon: IconWrench },
  'Vasıta & Araç': { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', Icon: IconCar },
  'Motosiklet': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500', Icon: IconMotorcycle },
};

function timeAgo(dateStr) {
  if (!dateStr) return 'Yeni';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Bugün';
  if (days === 1) return 'Dün';
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return `${Math.floor(days / 30)} ay önce`;
}

export default function ListingCard({ listing }) {
  const {
    _id, title, description, category, city, district,
    price, priceLabel, contactPhone, whatsappLink,
    images = [], isFeatured = false, owner, createdAt,
    status = 'active', businessType, businessFeatures = [],
  } = listing;

  const hasImage = images && images.length > 0 && Boolean(images[0]);
  const imageUrl = hasImage ? images[0] : null;

  const displayPrice = priceLabel
    ? priceLabel
    : price
    ? `${Number(price).toLocaleString('tr-TR')} ₺`
    : 'Fiyat Belirtilmedi';

  const catStyle = CATEGORY_STYLES[category] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500', Icon: IconBriefcase };
  const CategoryIcon = catStyle.Icon || IconBriefcase;

  const wa = whatsappLink || (contactPhone
    ? `https://wa.me/90${contactPhone.replace(/\D/g, '').slice(-10)}`
    : null);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col overflow-hidden group"
      id={`listing-card-${_id}`}
    >
      {/* Görsel Alanı */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
        
        {/* Öne Çıkan Rozeti */}
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
            <IconStar size={12} color="#0f172a" />
            Öne Çıkan
          </div>
        )}

        {/* Kategori Etiketi */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md bg-white/95 shadow-sm ${catStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
            {category}
          </span>
        </div>

        {/* Satıldı / Kapalı Durumu */}
        {status === 'sold' && (
          <div className="absolute inset-0 bg-slate-950/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-600 text-white font-extrabold px-4 py-1.5 rounded-xl text-sm tracking-wider uppercase shadow-lg rotate-[-6deg]">
              Tamamlandı / Satıldı
            </span>
          </div>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400">
            <CategoryIcon size={36} color="#94a3b8" />
            <span className="text-[11px] font-semibold text-slate-400 mt-2">Görsel Belirtilmedi</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* İçerik Alanı */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Konum & Tarih */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1 text-slate-600 font-semibold truncate max-w-[160px]">
            <IconPin size={14} color="#d97706" className="flex-shrink-0" />
            <span className="truncate">{district}, {city}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <IconCalendar size={12} color="#94a3b8" />
            <span>{timeAgo(createdAt)}</span>
          </div>
        </div>

        {/* Başlık */}
        <Link to={`/ilan/${_id}`} className="group/title">
          <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-2 leading-snug group-hover/title:text-amber-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* İşletme Sektör & Özellik Etiketleri */}
        {businessFeatures && businessFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {businessFeatures.slice(0, 3).map((feat, idx) => (
              <span key={idx} className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                {feat}
              </span>
            ))}
            {businessFeatures.length > 3 && (
              <span className="text-[10px] font-bold text-slate-400 self-center">
                +{businessFeatures.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Açıklama */}
        <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
          {description}
        </p>

        {/* Fiyat / Ücret */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fiyat / Ücret</div>
            <div className="text-lg font-black text-slate-900 tracking-tight">{displayPrice}</div>
          </div>

          {owner?.name && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400">İlan Sahibi</div>
              <div className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{owner.name.split(' ')[0]}</div>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className="flex items-center gap-2 mt-auto">
          <Link
            to={`/ilan/${_id}`}
            id={`detail-btn-${_id}`}
            className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-all"
          >
            Detay İncele
          </Link>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              id={`whatsapp-btn-${_id}`}
              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm hover:shadow transition-all"
              title="WhatsApp ile Mesaj Gönder"
            >
              <IconWhatsApp size={16} color="#fff" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
