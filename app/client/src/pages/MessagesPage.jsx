import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  IconUser, IconStore, IconSpinner, IconCheck, IconPin,
  IconClose, IconBuildingStore,
} from '../components/Icons';

import { API_BASE } from '../config/api';

export default function MessagesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Oturum kontrolü
  useEffect(() => {
    if (!user) {
      navigate('/giris');
    } else {
      fetchConversations();
    }
  }, [user, navigate]);

  // Sohbetleri getir
  const fetchConversations = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setConversations(data.data);

        // URL'de bir kullanıcı belirtilmişse onu seç
        if (targetUserId) {
          const existing = data.data.find((c) => c.partner.id === targetUserId || c.partner._id === targetUserId);
          if (existing) {
            setSelectedPartner(existing.partner);
            fetchMessages(existing.partner.id || existing.partner._id);
          } else {
            // Yeni sohbet başlatılıyor
            fetchPartnerProfile(targetUserId);
          }
        } else if (data.data.length > 0 && !selectedPartner) {
          setSelectedPartner(data.data[0].partner);
          fetchMessages(data.data[0].partner.id || data.data[0].partner._id);
        }
      }
    } catch (err) {
      console.error('Sohbetler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  // Yeni kullanıcı profili getir (ilk kez mesaj atılıyorsa)
  const fetchPartnerProfile = async (uid) => {
    try {
      const { data } = await axios.get(`${API_BASE}/listings/store/${uid}`);
      if (data.success && data.store) {
        const p = {
          id: data.store.id,
          _id: data.store.id,
          name: data.store.name,
          avatar: data.store.avatar || '',
          role: data.store.role || 'esnaf',
        };
        setSelectedPartner(p);
        fetchMessages(uid);
      }
    } catch (err) {
      console.error('Kullanıcı bulunamadı:', err);
    }
  };

  // Seçili kişiyle mesajları getir
  const fetchMessages = async (partnerId) => {
    try {
      const { data } = await axios.get(`${API_BASE}/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Mesajlar alınamadı:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Mesaj gönder
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { data } = await axios.post(
        `${API_BASE}/messages`,
        {
          recipientId: selectedPartner.id || selectedPartner._id,
          content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        scrollToBottom();
        // Sohbet listesini de güncelle
        fetchConversations();
      }
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      alert('Mesaj iletilemedi, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <IconSpinner size={36} color="#f59e0b" />
          <span className="text-xs font-bold text-amber-400">Mesajlarınız Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0c10] min-h-[calc(100vh-140px)] py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto bg-[#13151b] border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[750px] max-h-[85vh]">
        
        {/* ===== SOL: SOHBET LİSTESİ ===== */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col bg-[#0f1116]">
          
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              Site İçi Mesajlarım
            </h2>
            <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              {conversations.length} Sohbet
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
            {conversations.length === 0 && !selectedPartner ? (
              <div className="p-6 text-center text-neutral-400 text-xs">
                Henüz bir mesajınız yok. İlan detay sayfalarındaki &quot;Satıcıya Mesaj Gönder&quot; butonuna basarak ilk mesajınızı iletebilirsiniz!
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedPartner && (selectedPartner.id === c.partner.id || selectedPartner._id === c.partner._id);
                return (
                  <button
                    key={c.partner.id || c.partner._id}
                    type="button"
                    onClick={() => {
                      setSelectedPartner(c.partner);
                      fetchMessages(c.partner.id || c.partner._id);
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-neutral-800/90 border-l-4 border-amber-400' : 'hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 shadow overflow-hidden">
                      {c.partner.avatar ? (
                        <img src={c.partner.avatar} alt={c.partner.name} className="w-full h-full object-cover" />
                      ) : (
                        c.partner.name?.slice(0, 2).toUpperCase() || 'EP'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{c.partner.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">
                        {c.lastMessage.isSender ? 'Siz: ' : ''}{c.lastMessage.content}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ===== SAĞ: MESAJLAŞMA PENCERESİ ===== */}
        <div className="flex-1 flex flex-col bg-[#13151b]">
          {selectedPartner ? (
            <>
              {/* Sohbet Başlığı */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#101217]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow overflow-hidden">
                    {selectedPartner.avatar ? (
                      <img src={selectedPartner.avatar} alt={selectedPartner.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedPartner.name?.slice(0, 2).toUpperCase() || 'EP'
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{selectedPartner.name}</h3>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Çevrimiçi / Aktif
                    </span>
                  </div>
                </div>

                <Link
                  to={`/magaza/${selectedPartner.id || selectedPartner._id}`}
                  className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <IconBuildingStore size={14} color="#f59e0b" />
                  <span>Mağazasını Gör</span>
                </Link>
              </div>

              {/* Mesaj Akışı */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 text-xs">
                    <div className="p-4 rounded-full bg-neutral-800/80 mb-2">💬</div>
                    <p className="font-bold text-white mb-1">{selectedPartner.name} ile sohbeti başlatın</p>
                    <p className="text-[11px] max-w-xs">İlan hakkında sorularınızı, fiyat teklifinizi veya detayları doğrudan buradan sorabilirsiniz.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id?.toString() === (user._id || user.id)?.toString() || msg.sender === (user._id || user.id);
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-br-none'
                              : 'bg-neutral-800 text-white font-normal rounded-bl-none border border-neutral-700'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isMe ? 'text-amber-950 font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Hızlı Mesaj Şablonları */}
              <div className="px-4 py-2 bg-[#0e1014] border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => setNewMessage('Merhaba, ilanınız hala güncel mi?')}
                  className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition-colors"
                >
                  &quot;İlan güncel mi?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage('Fiyatta son ne olur? Pazarlık var mı?')}
                  className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition-colors"
                >
                  &quot;Pazarlık payı var mı?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage('Yeriniz tam olarak nerede? Konum atabilir misiniz?')}
                  className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition-colors"
                >
                  &quot;Konum nerede?&quot;
                </button>
              </div>

              {/* Mesaj Yazma Girişi */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-[#101217] border-t border-neutral-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-750 text-white text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {sending ? '...' : 'Gönder'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 text-xs p-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-2xl mb-3">💬</div>
              <h3 className="text-sm font-bold text-white mb-1">Bir Sohbet Seçin</h3>
              <p className="text-xs max-w-xs text-neutral-400">
                Sol taraftaki listeden bir kullanıcı seçerek mesajlaşmaya başlayabilir veya ilan detayından satıcıya mesaj atabilirsiniz.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
