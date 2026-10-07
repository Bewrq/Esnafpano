const User = require('./models/User');
const Listing = require('./models/Listing');

const seedData = async () => {
  try {
    console.log('👥 Örnek kullanıcılar oluşturuluyor...');
    const esnafUser = await User.findOne({ email: 'esnaf@esnafpano.com' }) || await User.create({
      name: 'Ahmet Karataş (Özlem Ticaret)',
      email: 'esnaf@esnafpano.com',
      password: 'password123',
      phone: '05321112233',
      role: 'esnaf',
      isApproved: true,
    });

    const bireyselUser = await User.findOne({ email: 'bireysel@esnafpano.com' }) || await User.create({
      name: 'Mehmet Yılmaz',
      email: 'bireysel@esnafpano.com',
      password: 'password123',
      phone: '05442223344',
      role: 'bireysel',
      isApproved: true,
    });

    console.log('📋 Örnek ilanlar ekleniyor...');
    const listings = [
      // === İŞ ARIYORUM ===
      {
        title: 'Deneyimli Aşçı / Mutfak Şefi İş Arıyor',
        description: 'Çanakkale merkez veya Gelibolu çevresinde 12 yıl restoran ve otel mutfağı tecrübeli aşçıyım. Türk mutfağı, ızgara ve soğuk mezelerde uzmanım. Hijyen belgem ve referanslarım mevcuttur.',
        category: 'İş Arıyorum',
        city: 'Çanakkale',
        district: 'Merkez',
        price: 32000,
        priceLabel: '32.000 ₺/ay',
        contactPhone: '05442223344',
        whatsappLink: 'https://wa.me/905442223344',
        images: ['https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: bireyselUser._id,
      },
      {
        title: 'B Sınıfı Elektrik & Pano Ustası İş Arıyor',
        description: 'Sanayi panosu montajı, bina içi tesisat ve akıllı ev otomasyonu alanında 8 yıllık tecrübem var. Kendi takım çantası ve aracımla aktif olarak iş aramaktayım.',
        category: 'İş Arıyorum',
        city: 'Bursa',
        district: 'Osmangazi',
        price: 950,
        priceLabel: '950 ₺/günlük',
        contactPhone: '05442223344',
        whatsappLink: 'https://wa.me/905442223344',
        images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop'],
        isFeatured: false,
        status: 'active',
        owner: bireyselUser._id,
      },
      {
        title: 'Full-Stack Web & E-Ticaret Geliştirici',
        description: 'Esnaflar ve KOBİ\'ler için modern e-ticaret siteleri, kurumsal web sayfaları ve mobil uygulamalar yapıyorum. React, Node.js ve SEO uzmanıyım. Proje bazlı veya tam zamanlı iş arıyorum.',
        category: 'İş Arıyorum',
        city: 'İzmir',
        district: 'Konak',
        price: 45000,
        priceLabel: '45.000 ₺/ay',
        contactPhone: '05442223344',
        whatsappLink: 'https://wa.me/905442223344',
        images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: bireyselUser._id,
      },

      // === ELEMAN ARANIYOR ===
      {
        title: 'Oto Mekanik ve Periyodik Bakım Ustası Aranıyor',
        description: 'Oto sanayi sitemizdeki özel servisimize mekanik ve motor arıza teşhisinde deneyimli usta aranıyor. SSK + Dolgun Maaş + Yemek imkânı sunulmaktadır.',
        category: 'Eleman Aranıyor',
        city: 'İstanbul',
        district: 'Ümraniye',
        price: 38000,
        priceLabel: '38.000 ₺/ay',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: 'Ön Muhasebe & Müşteri Karşılama Personeli',
        description: 'Firmamız bünyesinde fatura takibi, cari hesap mutabakatı ve gelen müşterileri yönlendirecek dikkatli ve güler yüzlü personel aranmaktadır. Mikro/Luca tecrübesi avantajdır.',
        category: 'Eleman Aranıyor',
        city: 'Ankara',
        district: 'Çankaya',
        price: 26000,
        priceLabel: '26.000 ₺/ay',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: 'Restoranımıza Servis Elemanı (Garson) & Kasiyer',
        description: 'Konyaaltı şubemizde haftanın 6 günü vardiyalı çalışabilecek, dinamik genç çalışma arkadaşları arıyoruz. Bahşiş paylaşımı ve servis imkânı mevcuttur.',
        category: 'Eleman Aranıyor',
        city: 'Antalya',
        district: 'Konyaaltı',
        price: 24000,
        priceLabel: '24.000 ₺/ay + Tip',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop'],
        isFeatured: false,
        status: 'active',
        owner: esnafUser._id,
      },

      // === DÜKKAN DEVİR/KİRALAMA ===
      {
        title: 'Çarşı İçi Hazır Kurulu Şarküteri & Gurme Market Devir',
        description: 'Kadıköy Moda caddesinde yüksek cirolu, oturmuş müşteri portföyüne sahip, soğuk hava deposu ve tüm barkodlu kasaları kurulu şarküteri dükkanı sağlık nedenleriyle devredilecektir.',
        category: 'Dükkan Devir/Kiralama',
        city: 'İstanbul',
        district: 'Kadıköy',
        price: 350000,
        priceLabel: '350.000 ₺ (Devir Bedeli)',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: 'Üniversite Karşısı İşlek Konumda Kafe & Bistro Devir',
        description: 'Öğrenci ve gençlerin yoğun olduğu caddede 110 m² kapalı, 40 m² bahçeli kahve ve tatlı konseptli işletme. İtalyan espresso makinesi ve tüm fırın ekipmanları fiyata dahildir.',
        category: 'Dükkan Devir/Kiralama',
        city: 'Eskişehir',
        district: 'Tepebaşı',
        price: 280000,
        priceLabel: '280.000 ₺ Devir',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: 'Sanayi Sitesinde Ruhsatlı Hazır Oto Yıkama & Kuaför',
        description: '3 araçlık yıkama peronu, kurutma alanı, köpük tankları ve müşteri bekleme salonu hazır. Su arıtma sistemi kuruludur. Devren kiralıktır.',
        category: 'Dükkan Devir/Kiralama',
        city: 'Kocaeli',
        district: 'Gebze',
        price: 160000,
        priceLabel: '160.000 ₺ Devren',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop'],
        isFeatured: false,
        status: 'active',
        owner: esnafUser._id,
      },

      // === HİZMET/USTALIK ===
      {
        title: 'Garantili Daire & Ofis Boya Badana Hizmeti',
        description: 'Eşyalı veya boş daireleriniz 1 günde titizlikle boyanır, zeminler ve mobilyalar maskeleme bandı ve naylonla korunur. Filli Boya ve Jotun malzemeleri kullanılır. Ücretsiz keşif yapılır.',
        category: 'Hizmet/Ustalık',
        city: 'İstanbul',
        district: 'Maltepe',
        price: 1200,
        priceLabel: '1.200 ₺/oda başı',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: '7/24 Kombi & Klima Bakım, Arıza Onarım Servisi',
        description: 'Tüm marka kombi ve klimalar için yetkili standartlarında garantili parça değişimi ve kışlık periyodik bakım. Hızlı servis ve faturalı işlem garantisi.',
        category: 'Hizmet/Ustalık',
        city: 'İzmir',
        district: 'Karşıyaka',
        price: 500,
        priceLabel: '500 ₺ sabit servis',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop'],
        isFeatured: true,
        status: 'active',
        owner: esnafUser._id,
      },
      {
        title: 'Özel Ölçü Masif Ahşap Mutfak & Banyo Dolabı İmalatı',
        description: 'Kendi atölyemizde birinci sınıf MDF ve lake kapaklı modern mutfak, vestiyer ve gömme dolap imalatı. 3D tasarım ve projelendirme ücretsizdir.',
        category: 'Hizmet/Ustalık',
        city: 'Çanakkale',
        district: 'Gelibolu',
        price: 2800,
        priceLabel: '2.800 ₺/metre tül',
        contactPhone: '05321112233',
        whatsappLink: 'https://wa.me/905321112233',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=400&fit=crop'],
        isFeatured: false,
        status: 'active',
        owner: esnafUser._id,
      },
    ];

    let added = 0;
    for (const listing of listings) {
      if (!(await Listing.exists({ title: listing.title, owner: listing.owner }))) {
        await Listing.create(listing);
        added++;
      }
    }
    if (!(await User.exists({ email: 'admin@esnafpano.example' }))) {
      await User.create({ name: 'Demo Yönetici', email: 'admin@esnafpano.example', password: 'password123', role: 'admin' });
    }
    const Message = require('./models/Message');
    if (!(await Message.exists({ sender: bireyselUser._id, recipient: esnafUser._id }))) {
      await Message.create({ sender: bireyselUser._id, recipient: esnafUser._id, content: 'Merhaba, ilanınızdaki hizmet hakkında bilgi alabilir miyim?' });
      await Message.create({ sender: esnafUser._id, recipient: bireyselUser._id, content: 'Merhaba! Elbette, ihtiyaçlarınızı birlikte değerlendirebiliriz.' });
    }
    console.log(added + ' yeni örnek ilan eklendi. Mevcut kayıtlar korundu.');
    console.log('✅ Demo Kullanıcılar:');
    console.log('   - Esnaf: esnaf@esnafpano.com / password123');
    console.log('   - Bireysel: bireysel@esnafpano.com / password123');
    console.log('   - Yönetici: admin@esnafpano.example / password123 (yalnızca yerel demo)');

    return { total: listings.length, added };
  } catch (error) {
    throw error;
  }
};

module.exports = { seedData };
