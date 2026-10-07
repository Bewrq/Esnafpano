import { Link } from 'react-router-dom';
import {
  IconSocialFacebook, IconSocialLinkedin, IconSocialTwitter,
  IconEmail, IconPhone, IconPin, IconArrowUp,
  IconBriefcase, IconStore, IconWrench, IconCoffee, IconTools, IconBuildingStore,
} from './Icons';

const CATEGORIES = [
  { label: 'Dükkan & İşletmeler', href: '/?category=Dükkan %26 İşletme Tanıtımı', Icon: IconBuildingStore },
  { label: 'Kafe & Restoranlar', href: '/?category=Kafe %26 Restoran', Icon: IconCoffee },
  { label: 'Oto Sanayi & Bakım', href: '/?category=Oto Sanayi %26 Araç Bakım', Icon: IconTools },
  { label: 'Hizmet & Ustalık', href: '/?category=Hizmet/Ustalık', Icon: IconWrench },
  { label: 'İş Arayanlar', href: '/?category=İş Arıyorum', Icon: IconBriefcase },
  { label: 'Eleman Arayanlar', href: '/?category=Eleman Aranıyor', Icon: IconBriefcase },
  { label: 'Dükkan Devir/Kira', href: '/?category=Dükkan Devir/Kiralama', Icon: IconStore },
];

export default function Footer() {
  return (
    <footer className="bg-[#08090b] text-neutral-300 mt-16 border-t border-neutral-800">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-[#121418] hover:bg-[#1a1d23] transition-colors text-center py-3.5 cursor-pointer flex items-center justify-center gap-2 border-b border-neutral-800"
      >
        <IconArrowUp size={16} color="#f59e0b" />
        <span className="text-xs text-neutral-200 font-bold tracking-wide">Sayfanın Başına Dön</span>
      </button>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-white font-black text-xl mb-4 tracking-tight">
            <span className="text-amber-400">Esnaf</span>Pano
          </h3>
          <p className="text-xs leading-relaxed text-neutral-400">
            Yerel esnaf ve iş ilanları için Türkiye'nin güvenilir platformu. Hızlı, kolay ve komisyonsuz doğrudan iletişim.
          </p>
          <div className="flex gap-2.5 mt-5">
            <a href="#" className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 hover:text-amber-400 text-neutral-300 transition-colors flex items-center justify-center">
              <IconSocialFacebook size={15} color="currentColor" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 hover:text-amber-400 text-neutral-300 transition-colors flex items-center justify-center">
              <IconSocialLinkedin size={15} color="currentColor" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400 hover:text-amber-400 text-neutral-300 transition-colors flex items-center justify-center">
              <IconSocialTwitter size={15} color="currentColor" />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-amber-400">Kategoriler</h4>
          <ul className="space-y-2.5">
            {CATEGORIES.map(({ label, href, Icon }) => (
              <li key={label}>
                <Link
                  to={href}
                  className="flex items-center gap-2 text-xs text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  <Icon size={13} color="#f59e0b" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-amber-400">Hızlı Erişim</h4>
          <ul className="space-y-2.5">
            <li><Link to="/" className="text-xs text-neutral-400 hover:text-white transition-colors">Ana Sayfa</Link></li>
            <li><Link to="/ilan-ver" className="text-xs text-neutral-400 hover:text-white transition-colors">İlan Ver</Link></li>
            <li><Link to="/giris" className="text-xs text-neutral-400 hover:text-white transition-colors">Giriş Yap</Link></li>
            <li><Link to="/kayit" className="text-xs text-neutral-400 hover:text-white transition-colors">Kayıt Ol</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider text-amber-400">İletişim</h4>
          <ul className="space-y-3 text-xs text-neutral-400">
            <li className="flex items-center gap-2.5">
              <IconEmail size={15} color="#f59e0b" />
              <span>destek@esnafpano.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <IconPin size={15} color="#f59e0b" />
              <span>Türkiye Geneli Yerel Hizmet</span>
            </li>
          </ul>
        </div>
      </div>
      {/* Copyright Sub-bar */}
      <div className="border-t border-neutral-850 py-5 text-center text-xs text-neutral-500 bg-black">
        <p>© 2026 EsnafPano. Tüm hakları saklıdır. Komisyonsuz yerel esnaf ve ilan platformu.</p>
      </div>
    </footer>
  );
}
