import { useState, useRef } from 'react';
import { processImageFile } from '../utils/imageUpload';
import { IconCamera, IconClose, IconPlus, IconSpinner, IconCheck } from './Icons';

export default function ImageUploader({ images = [], onChange, maxImages = 8 }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const fileInputRef = useRef(null);

  // Dosya seçimi yapıldığında
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      setError(`En fazla ${maxImages} adet fotoğraf yükleyebilirsiniz.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedPromises = files.map((file) => processImageFile(file));
      const newImages = await Promise.all(processedPromises);
      onChange([...images, ...newImages]);
    } catch (err) {
      setError(err.message || 'Görseller işlenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // URL ile görsel ekleme
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlValue.trim()) return;
    if (images.length >= maxImages) {
      setError(`En fazla ${maxImages} fotoğraf ekleyebilirsiniz.`);
      return;
    }
    onChange([...images, urlValue.trim()]);
    setUrlValue('');
  };

  // Görsel silme
  const handleRemoveImage = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Gizli Dosya Girişi */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
        id="device-image-file-input"
      />

      {/* Yükleme Butonu & Alanı */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          loading
            ? 'border-amber-400 bg-amber-50/40 cursor-wait'
            : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50/30'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-sm">
          {loading ? <IconSpinner size={24} color="#d97706" /> : <IconCamera size={24} color="#d97706" />}
        </div>
        <div className="text-sm font-bold text-slate-800">
          {loading ? 'Fotoğraflar işleniyor...' : 'Telefondan veya Bilgisayardan Fotoğraf Seç'}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          JPG, PNG veya WEBP formatında birden fazla fotoğraf seçebilirsiniz (Maksimum {maxImages} adet)
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Yüklenen Görsellerin Önizleme Grid'i */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span>Yüklenen Görseller ({images.length}/{maxImages})</span>
            <span className="text-[11px] text-slate-400 font-normal">İlk görsel kapak fotoğrafı olacaktır</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`İlan görseli ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Kapak
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Görseli Kaldır"
                >
                  <IconClose size={12} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatif: URL Bağlantısı ile Ekleme */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-slate-500 hover:text-amber-600 font-semibold underline cursor-pointer"
        >
          {showUrlInput ? 'Bağlantı eklemeyi gizle' : '+ Veya internetten resim bağlantısı (URL) ekle'}
        </button>

        {showUrlInput && (
          <form onSubmit={handleAddUrl} className="mt-2 flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
            >
              Ekle
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
