import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconWarning, IconSpinner, IconInfo, IconUser, IconStore } from '../components/Icons';

const ROLES = [
  { value: 'bireysel', label: 'Bireysel', desc: 'İş arayan veya hizmet veren bireyler', Icon: IconUser },
  { value: 'esnaf', label: 'Esnaf', desc: 'Dükkan sahibi veya işletme sahibi', Icon: IconStore },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    role: 'bireysel',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      return setError('Şifreler eşleşmiyor');
    }
    if (form.password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır');
    }

    setLoading(true);
    try {
      const { passwordConfirm, ...payload } = form;
      const result = await register(payload);
      if (result && result.success) {
        navigate('/');
      } else {
        setError((result && result.message) || 'Kayıt başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      // Bağlantı yoksa kayıt tamamlanmış gibi yönlendirme yapma.
      if (!err.response) {
        setError('Sunucuya ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin.');
        return;
      }
      // Backend hata döndürdü
      const msg = err.response?.data?.message;
      if (msg?.includes('duplicate') || msg?.includes('already') || msg?.includes('kullanılıyor')) {
        setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      } else {
        setError(msg || 'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const len = form.password.length;
    if (len === 0) return null;
    if (len < 6) return { level: 1, label: 'Çok Zayıf', color: 'bg-red-400' };
    if (len < 9) return { level: 2, label: 'Orta', color: 'bg-amber-400' };
    return { level: 3, label: 'Güçlü', color: 'bg-green-400' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-extrabold">
              <span className="text-amber-500">Esnaf</span>
              <span className="text-gray-900">Pano</span>
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Ücretsiz hesap oluşturun</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Kayıt Ol</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm flex items-start gap-2">
              <IconWarning size={18} color="#ef4444" className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Adınız ve soyadınız"
                className="input-field"
                required
                id="register-name-input"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="ornek@email.com"
                className="input-field"
                required
                id="register-email-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="05XX XXX XX XX"
                className="input-field"
                id="register-phone-input"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="En az 6 karakter"
                className="input-field"
                required
                minLength={6}
                id="register-password-input"
                autoComplete="new-password"
              />
              {/* Password strength */}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          lvl <= strength.level ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre Tekrar</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => update('passwordConfirm', e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                className={`input-field ${
                  form.passwordConfirm && form.password !== form.passwordConfirm
                    ? 'border-red-400 focus:ring-red-400'
                    : ''
                }`}
                required
                id="register-password-confirm-input"
                autoComplete="new-password"
              />
              {form.passwordConfirm && form.password !== form.passwordConfirm && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IconWarning size={12} color="#ef4444" />
                  Şifreler eşleşmiyor
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-500">
              <input type="checkbox" required className="accent-amber-400 mt-0.5" />
              <span>
                <a href="#" className="text-amber-600 hover:underline">Kullanım Koşulları</a>'nı ve{' '}
                <a href="#" className="text-amber-600 hover:underline">Gizlilik Politikası</a>'nı kabul ediyorum
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              id="register-submit-btn"
            >
              {loading ? (
                <>
                  <IconSpinner size={20} color="#000" />
                  Kayıt yapılıyor...
                </>
              ) : (
                'Ücretsiz Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link to="/giris" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
          <IconInfo size={16} color="#3b82f6" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600">
            Demo modunda backend bağlantısı olmadan da kayıt akışı çalışır. MongoDB bağlandığında veriler kaydedilir.
          </p>
        </div>
      </div>
    </div>
  );
}
