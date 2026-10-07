import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  IconPin, IconPhone, IconWhatsApp, IconEye, IconCalendar,
  IconStar, IconShield, IconCopy, IconCheck, IconUser,
  IconBuildingStore, IconClock, IconGlobe, IconTools, IconCheckCircle, IconStore,
  IconClose, IconSpinner,
} from '../components/Icons';

import { API_BASE } from '../config/api';

const CATEGORY_COLORS = {
  'Dükkan & İşletme Tanıtımı': 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
  'Kafe & Restoran': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  'Oto Sanayi & Araç Bakım': 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
  'İş Arıyorum': 'bg-blue-100 text-blue-700 border-blue-200',
  'Eleman Aranıyor': 'bg-green-100 text-green-700 border-green-200',
  'Dükkan Devir/Kiralama': 'bg-purple-100 text-purple-700 border-purple-200',
  'Hizmet/Ustalık': 'bg-orange-100 text-orange-700 border-orange-200',
  'Vasıta & Araç': 'bg-red-100 text-red-700 border-red-200',
  'Motosiklet': 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);

  // Mesaj Gönderme Modalı
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [directMessageText, setDirectMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Soru-Cevap State'leri
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/listings/${id}`);
      if (data.success && data.data) {
        setListing(data.data);
      } else {
        setListing(null);
      }
    } catch {
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const copyPhone = () => {
    if (!listing?.contactPhone) return;
    navigator.clipboard.writeText(listing.contactPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Satıcıya Doğrudan Mesaj Gönder
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/giris');
      return;
    }
    if (!directMessageText.trim()) return;

    setSendingMessage(true);
    try {
      const sellerId = listing.owner?._id || listing.owner;
      const { data } = await axios.post(
        `${API_BASE}/messages`,
        {
          recipientId: sellerId,
          content: directMessageText.trim(),
          listingId: listing._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setShowMessageModal(false);
        setDirectMessageText('');
        navigate(`/mesajlar?user=${sellerId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Mesaj iletilemedi.');
    } finally {
      setSendingMessage(false);
    }
  };

  // İlana Yeni Soru Sor
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/giris');
      return;
    }
    if (!questionText.trim()) return;

    setSubmittingQuestion(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/listings/${id}/questions`,
        { question: questionText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setListing((prev) => ({ ...prev, questions: data.questions }));
        setQuestionText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Soru iletilemedi.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Soruya Cevap Ver (İlan Sahibi)
  const handleAnswerQuestion = async (questionId) => {
    if (!answerText.trim()) return;
    setSubmittingAnswer(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/listings/${id}/questions/${questionId}/answer`,
        { answer: answerText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setListing((prev) => ({ ...prev, questions: data.questions }));
        setAnsweringQuestionId(null);
        setAnswerText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cevap yayınlanamadı.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconPin size={32} color="#dc2626" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">İlan Bulunamadı</h2>
        <p className="text-gray-500 mb-6">Bu ilan silinmiş veya yayından kaldırılmış olabilir.</p>
        <Link to="/" className="btn-primary">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const {
    title, description, price, priceLabel, category,
    city, district, address, contactPhone, whatsappLink,
    images = [], owner, viewCount, createdAt, status,
    businessFeatures = [], questions = [],
  } = listing;

  const displayPrice = priceLabel || (price ? `${Number(price).toLocaleString('tr-TR')} ₺` : 'Fiyat Belirtilmedi');
  const imgList = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1582650625119-3a31f841836d?auto=format&fit=crop&w=1200&q=80'];

  const cleanPhone = contactPhone ? contactPhone.replace(/\D/g, '') : '';
  const wa = whatsappLink || (cleanPhone ? `https://wa.me/90${cleanPhone.slice(-10)}` : '');
  const isOwner = user && (user._id === (owner?._id || owner) || user.id === (owner?._id || owner));

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5">
          <Link to="/" className="hover:text-amber-600 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link to={`/?category=${encodeURIComponent(category)}`} className="hover:text-amber-600 transition-colors">
            {category}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: IMAGES + DETAILS + QUESTIONS (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery */}
            <div className="card overflow-hidden p-3">
              <div className="relative aspect-[16/10] bg-gray-900 rounded-xl overflow-hidden mb-3">
                <img
                  src={imgList[selectedImage] || imgList[0]}
                  alt={title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {imgList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {imgList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImage === i ? 'border-amber-400 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Features */}
            {businessFeatures && businessFeatures.length > 0 && (
              <div className="card p-5 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border-amber-200/80">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <IconStore size={16} color="#d97706" />
                  <span>Sunulan Hizmetler &amp; Özellikler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {businessFeatures.map((feat, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold text-xs shadow-2xs">
                      <IconCheckCircle size={13} color="#d97706" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                {category === 'Dükkan & İşletme Tanıtımı' ? 'İşletme Hakkında & Detaylı Bilgi' : 'İlan Detayı'}
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {description}
              </div>
            </div>

            {/* Live Interactive Map */}
            <div className="card overflow-hidden border border-slate-200/90 shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconPin size={18} color="#d97706" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Konum &amp; Harita</h3>
                    <p className="text-[11px] text-gray-500">
                      {district}, {city} {address ? `• ${address}` : ''}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address ? address + ' ' : ''}${district} ${city} Türkiye`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all"
                >
                  Yol Tarifi Al ↗
                </a>
              </div>

              <div className="w-full h-64 bg-slate-100 relative">
                <iframe
                  title="İlan Haritası"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${address ? address + ' ' : ''}${district} ${city} Türkiye`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>

            {/* ==================== SORU - CEVAP MODÜLÜ ==================== */}
            <div className="card p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                    ❓
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">İlan Sahibine Soru Sor &amp; Cevaplar</h3>
                    <p className="text-xs text-gray-500">Bu ilan hakkında merak ettiklerinizi satıcıya doğrudan sorabilirsiniz.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {questions.length} Soru
                </span>
              </div>

              {/* Soru Sorma Formu */}
              {user ? (
                <form onSubmit={handleAddQuestion} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Örn: Araçta tramer kaydı var mı? / Takas düşünüyor musunuz? / Pazarlık payı var mı?"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="input-field text-xs flex-1"
                      maxLength={300}
                    />
                    <button
                      type="submit"
                      disabled={submittingQuestion || !questionText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {submittingQuestion ? 'İletiliyor...' : 'Soruyu Sor'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-gray-600 flex items-center justify-between">
                  <span>İlan sahibine soru sormak için lütfen giriş yapın.</span>
                  <Link to="/giris" className="text-amber-600 font-bold hover:underline">Giriş Yap ↗</Link>
                </div>
              )}

              {/* Sorular ve Cevaplar Listesi */}
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    Bu ilan için henüz soru sorulmamış. İlk soruyu siz sorun!
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q._id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2.5">
                      {/* Soru Başlığı */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          {q.userName || 'Kullanıcı'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(q.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 font-medium pl-3.5 border-l-2 border-amber-300">
                        {q.question}
                      </p>

                      {/* Satıcı Cevabı Varsa */}
                      {q.answer ? (
                        <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                            <span className="flex items-center gap-1">
                              <IconCheck size={13} color="#059669" />
                              İlan Sahibinin Cevabı:
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString('tr-TR') : ''}
                            </span>
                          </div>
                          <p className="font-semibold">{q.answer}</p>
                        </div>
                      ) : (
                        /* Satıcıysa ve Henüz Cevaplanmamışsa: Cevapla Butonu */
                        isOwner && (
                          <div className="pt-1">
                            {answeringQuestionId === q._id ? (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Soruyu yanıtlayın..."
                                  value={answerText}
                                  onChange={(e) => setAnswerText(e.target.value)}
                                  className="input-field text-xs flex-1"
                                  maxLength={300}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAnswerQuestion(q._id)}
                                  disabled={submittingAnswer || !answerText.trim()}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                                >
                                  {submittingAnswer ? '...' : 'Yanıtla'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAnsweringQuestionId(null)}
                                  className="px-3 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold"
                                >
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAnsweringQuestionId(q._id);
                                  setAnswerText('');
                                }}
                                className="text-xs text-amber-600 font-bold hover:underline"
                              >
                                + Bu Soruyu Cevapla
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: SELLER CARD & ACTIONS */}
          <div className="space-y-5">
            
            {/* Title & Category */}
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {category}
                </span>
                {status === 'sold' && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    Tamamlandı
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-4">{title}</h1>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="text-xs text-amber-600 font-medium mb-1">Fiyat / Maaş</div>
                <div className="text-2xl font-extrabold text-amber-600">{displayPrice}</div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <IconPin size={15} color="#f59e0b" />
                <span>{district}, {city}</span>
              </div>
              {address && <div className="text-xs text-gray-500 ml-5 mb-4">{address}</div>}

              <div className="flex gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1">
                  <IconEye size={13} color="#9ca3af" />
                  {viewCount || 0} görüntülenme
                </span>
                <span className="flex items-center gap-1">
                  <IconCalendar size={12} color="#9ca3af" />
                  {new Date(createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
                  <IconUser size={22} color="#fff" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{owner?.name || 'Satıcı'}</div>
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block font-medium mt-0.5">
                    {owner?.role === 'esnaf' ? 'Esnaf' : owner?.role === 'admin' ? 'Yönetici' : 'Bireysel'}
                  </div>
                </div>
              </div>

              {/* SİTE İÇİ MESAJ GÖNDER BUTONU (HER İLANDA ÇALIŞIR) */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/giris');
                  } else {
                    setShowMessageModal(true);
                  }
                }}
                className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg mb-3 cursor-pointer"
                id="site-message-btn"
              >
                <span className="text-base">💬</span>
                <span>Satıcıya Mesaj Gönder</span>
              </button>

              {/* TELEFON NUMARASI VARSA GÖSTER */}
              {contactPhone ? (
                <>
                  {/* Hemen Ara */}
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center justify-center gap-3 w-full border-2 border-amber-400 text-amber-700 hover:bg-amber-400 hover:text-black font-bold py-3 rounded-xl transition-all duration-200 mb-2.5 group"
                    id="call-btn"
                  >
                    <IconPhone size={17} color="currentColor" className="group-hover:scale-110 transition-transform" />
                    Hemen Ara
                  </a>

                  {/* Copy Phone */}
                  <button
                    onClick={copyPhone}
                    className="w-full text-center text-xs text-gray-500 hover:text-amber-600 transition-colors py-1.5 rounded-lg hover:bg-amber-50 mb-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
                    id="copy-phone-btn"
                  >
                    {copied
                      ? <><IconCheck size={14} color="#22c55e" /> Kopyalandı!</>
                      : <><IconCopy size={14} color="currentColor" /> {contactPhone}</>
                    }
                  </button>

                  {/* WhatsApp */}
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow hover:shadow-lg hover:scale-[1.01]"
                      id="whatsapp-contact-btn"
                    >
                      <IconWhatsApp size={18} color="#fff" />
                      WhatsApp&apos;tan Yaz
                    </a>
                  )}
                </>
              ) : (
                /* TELEFON OLMADIĞINDA BİLGİ KUTUSU */
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-600 mb-3 text-center">
                  📞 Satıcı telefon numarası belirtmedi. Sorularınızı yukarıdaki <strong>&quot;Satıcıya Mesaj Gönder&quot;</strong> butonundan veya <strong>Soru &amp; Cevap</strong> modülünden iletebilirsiniz.
                </div>
              )}

              {/* Satıcının Mağazasına Git */}
              {(owner?._id || owner) && (
                <Link
                  to={`/magaza/${owner?._id || owner}`}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 text-xs transition-all shadow-2xs"
                  id="view-store-btn"
                >
                  <IconStore size={15} color="#d97706" />
                  <span>Satıcının Mağazasını Gör ↗</span>
                </Link>
              )}

              <p className="text-[11px] text-gray-400 text-center mt-3">
                İletişim ve mesajlaşma kayıtları güvenle saklanır
              </p>
            </div>

            {/* Güvenlik İpuçları */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <IconShield size={16} color="#1d4ed8" />
                Güvenlik İpuçları
              </h4>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Yüksek miktarda peşin ödeme yapmayın</li>
                <li>• Tanışmayı halka açık yerlerde yapın</li>
                <li>• Ürünü görmeden kapora göndermeyin</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* ===== SİTE İÇİ HIZLI MESAJ GÖNDERME MODALI ===== */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{owner?.name || 'Satıcı'} ile Mesajlaşın</h3>
                  <p className="text-[11px] text-gray-500 truncate max-w-[240px]">{title}</p>
                </div>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                <IconClose size={18} color="currentColor" />
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-3">
              {/* Hızlı Şablonlar */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['İlan hala güncel mi?', 'Fiyatta pazarlık payı var mı?', 'Ne zaman görebilirim?'].map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDirectMessageText(q)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <textarea
                value={directMessageText}
                onChange={(e) => setDirectMessageText(e.target.value)}
                placeholder="Mesajınızı buraya yazın..."
                rows={4}
                className="input-field text-xs resize-none"
                maxLength={1000}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage || !directMessageText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {sendingMessage ? 'Gönderiliyor...' : 'Mesajı Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
