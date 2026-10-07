======================================================================
                             ESNAFPANO
             Yerel Esnaf, İşletme ve İş İlanları Platformu
======================================================================

Mahallendeki esnafı keşfet. İş fırsatlarını bul. İlanını yayınla.

GitHub'daki görselli rehber: docs/README.md
Ekran görüntüleri: docs/screenshots/

1. PROJE NE YAPAR?
----------------------------------------------------------------------
EsnafPano; işletme tanıtımı, iş arama, eleman arama, dükkan devri,
hizmet/ustalık ve araç ilanlarını tek bir Türkçe arayüzde birleştirir.

Teknolojiler:
  - Arayüz: React 19, Vite 6, Tailwind CSS 3, React Router.
  - Sunucu: Node.js, Express, JWT oturumları, bcrypt parola özeti.
  - Veritabanı: MongoDB ve Mongoose.

Kaynaklar app/client/ ve app/server/ klasörlerinde düzenli tutulur.
Kurulum ve çalıştırma Newproje kökünden yapılır. İki klasöre ayrı ayrı
girip paket kurmak veya iki terminalden sunucu başlatmak gerekmez.

Ana dizinde yalnızca package.json, package-lock.json ve .gitignore
bulunur. Uygulama app/, ortak dosyalar global/, belgeler docs/ altında
toplanmıştır.

2. GEREKSİNİMLER
----------------------------------------------------------------------
  - Node.js 22 LTS ve npm 10 veya üzeri önerilir.
  - Desteklenen alt sınır Node.js 20.19'dur.
  - İndirme: https://nodejs.org/en/download/
  - İlk kurulum için internet bağlantısı.
  - Git ile klonlama veya GitHub'dan Code > Download ZIP.

Sürümleri kontrol edin:
  node --version
  npm --version

MongoDB'yi ayrıca kurmanız gerekmez. Yerel geliştirmede ilk npm start
gerekli MongoDB dosyasını indirir. Windows indirmesi yaklaşık 600 MB
olabilir; tamamlanmasını bekleyin. Sonraki açılışlar önbelleği kullanır.

3. ADIM ADIM KURULUM
----------------------------------------------------------------------
A) GitHub'dan indirin:
  git clone https://github.com/GITHUB_KULLANICINIZ/DEPO_ADINIZ.git
  cd DEPO_ADINIZ

Adresi kendi GitHub kullanıcı ve depo adınızla değiştirin.
ZIP kullanıyorsanız arşivi açıp kök package.json bulunan klasörde
terminal açın. Bu bilgisayardaki klasör:
  C:\Users\KULLANICI_ADINIZ\Desktop\Newproje

B) Bağımlılıkları kurun:
  npm install

C) Uygulamayı başlatın:
  npm start

D) Tarayıcıda açın:
  http://localhost:5173

API ve veritabanı kontrolü:
  http://localhost:5000/api/health

İlk açılışta global/config/.env ve benzersiz JWT anahtarı oluşturulur.
Yerel veritabanı, API ve React arayüzü birlikte açılır.
API, veritabanı bağlanmadan hazır sayılmaz.

Windows PowerShell npm.ps1 hatası veriyorsa:
  npm.cmd install
  npm.cmd start

Durdurmak için Ctrl+C kullanın. Kullanıcılar, ilanlar ve mesajlar
global/data/mongodb/ içinde saklanır; yeniden açıldığında korunur.

4. DEMO VERİLERİ VE HESAPLAR
----------------------------------------------------------------------
İkinci bir terminalde, aynı proje kökünde:
  npm run seed

Komut 12 örnek ilan, üç demo hesabı ve bir sohbet oluşturur.
Mevcut veriler silinmez. Tekrar çalıştırmak aynı ilanları çoğaltmaz.
Uygulama kapalıyken de yerel veritabanını açıp örnek verileri ekler.

Esnaf:
  E-posta: esnaf@esnafpano.com
  Şifre: password123

Bireysel:
  E-posta: bireysel@esnafpano.com
  Şifre: password123

Demo yönetici:
  E-posta: admin@esnafpano.example
  Şifre: password123

Bu hesapları üretimde kullanmayın. Harici bir geliştirme veritabanına
bilerek demo eklemek için:
  npm run seed -- --allow-external

5. SİTENİN KULLANIMI
----------------------------------------------------------------------
İlan bulma:
  Ana sayfada şehir ve arama metni seçin. Kategori ve fiyat
  filtreleriyle sonuçları daraltın. Karttan ilan detayını açın.

Hesap oluşturma:
  Kayıt Ol sayfasında ad, e-posta, telefon ve şifre bilgilerini girin.
  Giriş Yap ekranında e-posta ya da telefon numarasıyla giriş yapın.

İlan yayınlama:
  1) Giriş yapın ve İlan Ver bağlantısını açın.
  2) Kategori, şehir ve ilçe seçin. Adres isteğe bağlıdır.
  3) Başlık, açıklama ve gerekli detayları girin.
     İşletme tanıtımında sektör, hizmetler, çalışma saatleri ve
     sosyal bağlantılar da eklenebilir.
  4) Cihazdan fotoğraf seçin veya görsel bağlantısı ekleyin.
  5) İsteğe bağlı telefon/WhatsApp bilgilerini ekleyin.
     Özeti kontrol edip ilanı yayınlayın.

Telefon zorunlu değildir. Seçilen görseller tarayıcıda optimize edilip
veri URL'si olarak MongoDB'ye kaydedilir.

İlan yönetimi:
  İlanlarım ekranında ilanınızı düzenleyin, yayında/satıldı durumunu
  değiştirin veya silin.

Mağaza:
  Mağazam bölümünde profil adı, telefon ve profil görselini güncelleyin.
  Mağaza QR kodunu paylaşın veya yazdırın.

İletişim:
  Telefon bulunan ilanlarda arama ve WhatsApp bağlantılarını kullanın.
  Giriş yaparak özel mesaj gönderin ve Mesajlarım ekranında sohbeti
  takip edin. İlan altındaki soruları ilan sahibi yanıtlayabilir.

Yönetici:
  Demo yöneticiyle /admin sayfasını açabilirsiniz.
  Kendi hesabınız için önce kayıt oluşturun, sonra global/config/.env içine:
    ADMIN_EMAIL=sizin-adresiniz@example.com
  yazın. Uygulamayı yeniden başlatıp tekrar giriş yapın.
  Kullanıcı ve ilan yönetimi bu panelden yapılır.

6. KÖKTEN ÇALIŞTIRILAN KOMUTLAR
----------------------------------------------------------------------
  npm install          Bağımlılıkları kurar.
  npm ci               Kilit dosyasından temiz ve kesin kurulum yapar.
  npm start            Veritabanı, API ve arayüzü açar.
  npm run dev          npm start ile aynı geliştirme akışıdır.
  npm run seed         Mevcut kayıtları silmeden demo ekler.
  npm run build        Arayüzü app/client/dist içine derler.
  npm run lint         İstemci kodunun statik kontrolünü çalıştırır.
  npm run start:prod   Harici MongoDB ile üretim uygulamasını açar.
  npm run screenshots  Ayrı demo ortamından 11 ekran görüntüsü alır.

React ve API kaynak değişiklikleri geliştirmede otomatik yüklenir.
global/config/.env değişince kök npm start işlemini durdurup yeniden çalıştırın.

7. AYARLAR
----------------------------------------------------------------------
global/config/.env.example paylaşılabilir şablondur; gerçek ayarlar global/config/.env içindedir.

  MONGODB_URI       Boş: kalıcı yerel geliştirme veritabanı.
                    Dolu: kendi MongoDB veya Atlas bağlantınız.
  JWT_SECRET        Oturum anahtarı; ilk açılışta benzersiz üretilir.
  JWT_EXPIRE        Varsayılan 30d.
  PORT              API portu; varsayılan 5000.
  CLIENT_PORT       Geliştirme arayüzü portu; varsayılan 5173.
  HOST              API dinleme adresi; varsayılan 127.0.0.1.
  CLIENT_HOST       Arayüz dinleme adresi; varsayılan 127.0.0.1.
  CLIENT_ORIGIN     İzin verilen istemci adresi.
                    Birden fazla adresi virgülle ayırabilirsiniz.
  NODE_ENV          Geliştirmede development.
  ADMIN_EMAIL       Kendi mevcut yönetici hesabınızın adresi.
  VITE_API_BASE_URL Boşken /api. API ayrı sunucudaysa tam adres.
                    Bu alan derlemede tarayıcıya açık hale gelir.

Kurulu MongoDB için örnek:
  MONGODB_URI=mongodb://127.0.0.1:27017/esnafpano

Atlas kullanıyorsanız bağlantı adresini global/config/.env içine yazın. Veritabanı
kullanıcısını ve ağ erişimini Atlas tarafında yapılandırın.

8. ÜRETİM ORTAMI
----------------------------------------------------------------------
  1) Kendi MONGODB_URI adresinizi ayarlayın.
  2) En az 32 karakterli JWT_SECRET kullanın.
  3) CLIENT_ORIGIN alanına sitenizin adresini yazın.
  4) Dışarıdan erişim için HOST=0.0.0.0 ayarlayın.
  5) Çalıştırın:
       npm ci
       npm run build
       npm run start:prod

Arayüz ve API varsayılan http://localhost:5000 adresinden sunulur.
Doğrudan sayfa bağlantıları desteklenir. Üretimde otomatik geliştirme
veritabanı açılmaz; harici MongoDB gerekir. İnternette HTTPS kullanın.

GitHub'a kaynak yüklemek uygulamayı internette çalıştırmaz.
GitHub Pages tek başına Node.js API'sini barındıramaz.

9. EKRAN GÖRÜNTÜLERİ
----------------------------------------------------------------------
GitHub rehberinde başlıklara tıklayınca görseller açılır. Her ekran ayrı
bir açılır bölümde yer alır; görsele tıklayınca tam boyutuna ulaşılır.

  docs/screenshots/01-ana-sayfa.png
  docs/screenshots/02-ilan-detayi.png
  docs/screenshots/03-giris.png
  docs/screenshots/04-kayit.png
  docs/screenshots/05-ilan-olustur.png
  docs/screenshots/06-isletme-detaylari.png
  docs/screenshots/07-ilanlarim.png
  docs/screenshots/08-magaza.png
  docs/screenshots/09-mesajlar.png
  docs/screenshots/10-yonetici-paneli.png
  docs/screenshots/11-mobil.png

Yeniden oluşturmak için:
  npx playwright install chromium
  npm run screenshots

Chrome kuruluysa kullanılabilir. Komut ayrı geçici demo veritabanıyla
çalışır; yerel özel kayıtlarınız ekran görüntülerine girmez.

10. GITHUB'A PAYLAŞMA
----------------------------------------------------------------------
GitHub'da yeni, boş bir depo oluşturun. Adresi kendinize göre değiştirin:
  git init
  git add .
  git status --short
  git commit -m "EsnafPano: kurulum, uygulama ve dokumantasyon"
  git branch -M main
  git remote add origin https://github.com/GITHUB_KULLANICINIZ/DEPO_ADINIZ.git
  git push -u origin main

docs/README.md, docs/README.txt, docs/LICENSE.txt,
global/config/.env.example, package-lock.json ve görselleri
birlikte paylaşın. .gitignore; node_modules, gerçek global/config/.env dosyaları,
global/data/, derleme çıktıları ve yerel araçları paylaşım dışında tutar.

Hazır ZIP'in EsnafPano/ klasöründeki dosya ve klasörleri depo köküne
yükleyin. ZIP dosyasını tek başına yüklemek yerine içeriğini paylaşın.

Depo açıklaması:
  React ve Node.js ile yerel esnaf, işletme ve iş ilanları platformu.
  Tek komutla geliştirme ortamı, mesajlaşma, mağaza ve yönetici paneli.

11. SIK KARŞILAŞILAN SORUNLAR
----------------------------------------------------------------------
package.json bulunamıyor:
  Terminali Newproje kökünde açın.

npm.ps1 engelleniyor:
  Komutlarda npm yerine npm.cmd kullanın.

EBADENGINE veya Oxlint native binding hatası:
  Node.js 22 LTS kurun ve npm ci çalıştırın.

İlk açılış uzun sürüyor:
  MongoDB indirmesini bekleyin; sonraki açılışta tekrar indirilmez.

Port kullanımda:
  Açık EsnafPano terminalini kapatın veya global/config/.env portlarını değiştirin.

İlanlar boş / demo girişi başarısız:
  npm run seed çalıştırın.

Harici MongoDB bağlanmıyor:
  Bağlantı adresi, kullanıcı, şifre ve ağ erişimini kontrol edin.

Harita, QR veya görseller açılmıyor:
  Harici servisler için internet erişimini kontrol edin.

Yönetici menüsü görünmüyor:
  ADMIN_EMAIL adresini doğru ayarlayıp uygulamayı yeniden başlatın.

12. MEVCUT SINIRLAR VE LİSANS
----------------------------------------------------------------------
Şifre sıfırlama bağlantısı henüz tamamlanmış değildir. Yönetici
panelindeki ziyaretçi trendleri örnek verilerdir; kullanıcı ve ilan
sayıları veritabanından gelir. Mesajlar REST API üzerinden çalışır.
Google Fonts, harita, QR ve örnek fotoğraflar harici servislere bağlıdır.

Telif hakkı © 2026 Bewrq (Replyfe markası).
GitHub: https://github.com/Bewrq
Marka: Replyfe - http://replyfe.com/

EsnafPano Kişisel Kullanım Lisansı v1.0: docs/LICENSE.txt
Kişisel ve ticari olmayan kullanım ücretsizdir. Şirket/işletme,
müşteri projesi, ücretli hizmet, reklam geliri, ticari kullanım ve
satış için hak sahibinin önceden yazılı izni gerekir. Telif ve lisans
bildirimleri korunmalıdır. Yeniden dağıtım koşulları lisans metnindedir.

GitHub'da görüntüleme/fork hakları saklıdır; ticari izin yerine geçmez.
Bağımlılıklar ve üçüncü taraf içerikler kendi lisanslarına tabidir.
Bu, MIT veya OSI onaylı bir açık kaynak lisansı değildir.
Tam koşullar için docs/LICENSE.txt dosyasını okuyun.

======================================================================
                      ESNAFPANO - KURULUM REHBERİ
======================================================================
