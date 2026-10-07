/**
 * Cihazdan (bilgisayar veya telefon) seçilen görseli canvas ile optimize edip base64 formatına çevirir.
 * @param {File} file - Seçilen dosya
 * @param {number} maxWidth - Maksimum genişlik (px)
 * @param {number} quality - JPEG kalitesi (0.0 - 1.0)
 * @returns {Promise<string>} Base64 Data URL
 */
export function processImageFile(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Görsel işlenirken bir hata oluştu.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}
