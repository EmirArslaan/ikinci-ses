# Socket.io Server Kurulumu

Socket.io server'ı Next.js'ten ayrı olarak çalıştırmanız gerekiyor.

## Adımlar:

### 1. Terminal'de iki komut çalıştırın:

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - Socket.io Server:**
```bash
npm run dev:socket
```

### 2. Çıktılar:

Terminal 1:
```
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

Terminal 2:
```
🚀 Socket.io server running on http://localhost:3001
```

### 3. Test:

1. http://localhost:3000/messages sayfasını açın
2. "Bağlı" yeşil badge'i görmelisiniz
3. Mesaj gönderip alabilirsiniz

## Sorun Yaşarsanız:

Console'da şunları kontrol edin:
- `✅ User connected: [userId]`
- `Socket connected`

## Production için:

Production'da:
- Socket server ayrı bir servis olarak deploy edilmeli (Render, Railway, etc.)
- `NEXT_PUBLIC_SOCKET_URL` environment variable ile URL ayarlanmalı

Şimdilik localhost:3001 kullanın!
