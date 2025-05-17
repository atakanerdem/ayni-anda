# Aynı Anda

Aynı Anda (At the Same Time), insanların şu anda yaptıkları aktiviteleri paylaşmalarını ve aynı aktiviteyi yapan kaç kişi olduğunu görmelerini sağlayan bir web uygulamasıdır.

## Özellikler

- Kullanıcılar şu anda yaptıkları aktiviteyi girebilirler
- Aynı aktiviteyi yapan kişi sayısı real-time olarak güncellenir
- En popüler üç aktivite "TREND" etiketi ile işaretlenir
- Aktiviteler gerçek zamanlı olarak güncellenir (Socket.io ile)
- Kullanıcılar aktif bir aktiviteyi bitirebilirler

## Teknolojiler

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Veritabanı**: MongoDB
- **Real-time İletişim**: Socket.io

## Kurulum

1. Projeyi klonlayın
   ```
   git clone https://github.com/yourusername/ayni-anda.git
   cd ayni-anda
   ```

2. Bağımlılıkları yükleyin
   ```
   npm install
   ```

3. MongoDB'yi yükleyin ve çalıştırın
   - [MongoDB indirme sayfası](https://www.mongodb.com/try/download/community)
   - Veya MongoDB Atlas hesabı oluşturun

4. `.env.local` dosyasını düzenleyin
   ```
   MONGODB_URI=mongodb://localhost:27017/ayni-anda
   ```
   (Eğer MongoDB Atlas kullanıyorsanız, uygun bağlantı URL'sini ekleyin)

5. Uygulamayı geliştirme modunda çalıştırın
   ```
   npm run dev
   ```

6. Tarayıcınızda `http://localhost:3000` adresine gidin

## Kullanım

1. Ana sayfadaki formda şu an yaptığınız aktiviteyi yazın ve "Başlat" düğmesine tıklayın
2. Aktiviteniz "Aktif Aktiviteler" listesine eklenecektir
3. Aynı aktiviteyi yapan başka biri olduğunda, o aktivitenin sayısı artacaktır
4. Aktivitenizi bitirmek için "Bitir" düğmesine tıklayın

## Dağıtım (Deployment)

Uygulamayı Vercel'e tek tıklamayla deploy edebilirsiniz:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ayni-anda)

## Lisans

MIT

## Pusher Entegrasyonu

Bu projenin real-time özelliklerini kullanabilmek için Pusher hesabı oluşturmanız gerekmektedir.

### Adımlar:

1. [Pusher](https://pusher.com) adresinden bir hesap oluşturun
2. Yeni bir Channels uygulaması oluşturun
3. Oluşturduğunuz uygulamanın bilgilerini (App ID, Key, Secret, Cluster) `.env.local` dosyasına ekleyin:

```
# Pusher Credentials
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=eu

# Client-side Pusher (NEXT_ öneki gerekli)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

4. Uygulamayı çalıştırın: `npm run dev`

Not: Pusher ücretsiz planında günlük 200.000 mesaj ve 100 eşzamanlı bağlantı limiti vardır.
