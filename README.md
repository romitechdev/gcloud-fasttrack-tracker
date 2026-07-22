# GSA Google Cloud Skill Boost Tracker

Website tracker progress untuk Google Cloud Skill Boost Fasttrack Labs.

## Fitur
- **Multi-user**: Pengguna login cukup menggunakan URL Google Cloud Skills Boost Public Profile mereka.
- **Auto-Sync**: Menarik data kelulusan badge/lab secara realtime via scraping HTML public profile pihak Google (tanpa local files).
- **Penanda Error**: Dapat menandai lab bermasalah / error dengan warna merah.
- **Auto-run**: Dijalankan 24/7 di Docker container dengan systemd service (`gsa-web.service`).

## Teknologi
- Next.js 16 (App Router)
- SQLite & Prisma
- Tailwind CSS & Shadcn UI
- Docker & Docker Compose
- Cloudflare Tunnel

## Cara Menjalankan secara Lokal

1. Duplikasi `.env.example` ke `.env`
2. Instalasi depedensi:
```bash
npm install
```
3. Migrasi database SQLite:
```bash
npx prisma db push
```
4. Build dan jalankan mode development:
```bash
npm run dev
```

## Docker Deploy

Jalankan container:
```bash
docker compose up -d --build
```
