import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconWarning, IconSpinner, IconInfo, IconEye, IconEyeOff } from '../components/Icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result && result.success) {
        navigate('/');
      } else {
        setError((result && result.message) || 'Giriş başarısız. Bilgilerinizi kontrol ediniz.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'E-posta / Telefon veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-500 mt-2 text-sm">Hesabınıza giriş yapın</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Giriş Yap</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm flex items-start gap-2">
              <IconWarning size={18} color="#ef4444" className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta veya Telefon Numarası
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ornek@email.com veya 05XX XXX XX XX"
                className="input-field"
                required
                id="login-email-input"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Şifre</label>
                <a href="#" className="text-xs text-amber-600 hover:text-amber-700">Şifremi unuttum</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                  minLength={6}
                  id="login-password-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <IconEyeOff size={18} color="currentColor" />
                    : <IconEye size={18} color="currentColor" />
                  }
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-amber-400 w-4 h-4" />
              <span className="text-sm text-gray-600">Beni Hatırla</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <IconSpinner size={20} color="#000" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>



          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
