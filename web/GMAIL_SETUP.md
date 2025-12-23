# İkinci Ses - Ücretsiz Email Kurulumu (Gmail SMTP)

## 🎯 Avantajlar

- ✅ **Tamamen Ücretsiz** - Hiçbir ücret yok
- ✅ **500 Email/Gün** - Günlük limit
- ✅ **Harici Servis Yok** - API key, kredi kartı gerekmez
- ✅ **Kolay Kurulum** - 5 dakika

---

## 📧 Gmail SMTP Kurulum Adımları

### 1. Gmail Hesabı (Varsa Atla)

Eğer Gmail hesabınız yoksa:
- https://accounts.google.com/signup adresinden hesap oluşturun

### 2. 2-Step Verification Aktif Edin

1. Google hesabınıza giriş yapın
2. https://myaccount.google.com/security adresine gidin  
3. "2-Step Verification" bölümünü bulun
4. Aktif edin (telefon numarası gerekecek)

### 3. App Password Oluşturun

1. https://myaccount.google.com/apppasswords adresine gidin
2. "Select app" → "Mail" seçin
3. "Select device" → "Other" seçin
4. İsim verin: "İkinci Ses"
5. "Generate" butonuna tıklayın
6. **16 haneli şifreyi kopyalayın** (örn: `abcd efgh ijkl mnop`)

⚠️ **Önemli:** Bu şifreyi bir kenara not edin, tekrar gösterilmeyecek!

### 4. Environment Variables Ekleyin

`.env` dosyanıza ekleyin:

```env
# Gmail SMTP - Ücretsiz Email Servisi
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=İkinci Ses
```

**Örnek:**
```env
GMAIL_USER=ikincises@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=İkinci Ses
```

### 5. Serveri Restart Edin

```bash
npm run dev
```

✅ **Artık gerçek email'ler gönderiliyor!**

---

## 🧪 Test Etme

### Kayıt Flow Test

1. http://localhost:3000/auth/register sayfasına git
2. Email adresinizi girin
3. Birkaç saniye içinde Gmail'inize kod gelecek
4. 6 haneli kodu girin
5. ✅ Kayıt tamamlandı!

### Console Log

Başarılı gönderimde:
```
✅ Verification email sent to user@example.com
✅ Welcome email sent to user@example.com
```

---

## 🔧 Sorun Giderme

### Email Gelmiyor?

**1. Spam Klasörünü Kontrol Edin**
- Gmail'de "Spam" klasörüne bakın

**2. App Password Doğru mu?**
- 16 hane olmalı
- Boşluksuz yazın: `abcdefghijklmnop`

**3. 2-Step Verification Aktif mi?**
- https://myaccount.google.com/security
- "2-Step Verification" ON olmalı

**4. Console'da Hata Var mı?**
```bash
# Terminal'de şunu görüyorsanız:
❌ Email send error: Invalid login

# Çözüm: App Password'ü yeniden oluşturun
```

### Demo Mode'da Çalışıyor

Eğer console'da şunu görüyorsanız:
```
⚠️  Gmail SMTP not configured. Running in DEMO mode.
📧 Demo verification email to user@example.com:
```

**Çözüm:** `.env` dosyasında `GMAIL_USER` ve `GMAIL_APP_PASSWORD` eksik

---

## 📊 Limitler

| Özellik | Limit |
|---------|-------|
| Günlük Email | 500 |
| Saat Başı | ~50 |
| Attachment | 25 MB |
| Recipients | 500/email |

**500 email/gün** normal kullanım için fazlasıyla yeterli!

---

## 🔒 Güvenlik

### App Password vs Normal Password

- ✅ **App Password** - Sadece email göndermek için
- ❌ **Normal Password** - Asla kodda kullanmayın!

### .env.example

`.env.example` dosyasında placeholder:
```env
# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
EMAIL_FROM_NAME=İkinci Ses
```

### .gitignore

`.env` dosyası gitignore'da olmalı:
```
.env
.env.local
```

---

## 🚀 Production

Production'da da aynı sistem çalışır:

1. Production Gmail hesabı oluşturun
2. App Password alın
3. Environment variables'ı production'a ekleyin
4. Deploy edin

**Alternatif:** Production için profesyonel email domain kullanmak isterseniz:
- Brevo: 300 email/gün ücretsiz
- Resend: 100 email/gün ücretsiz

Ama Gmail SMTP çoğu proje için yeterli!

---

## ✅ Tamamlandı!

Artık:
- ✅ Kayıt olduğunda otomatik 6 haneli kod gidiyor
- ✅ Welcome email gönderiliyor
- ✅ Notification email'leri çalışıyor
- ✅ Hiçbir ücret yok

**Tamamen ücretsiz, sınırsız kullanım!** 🎉
