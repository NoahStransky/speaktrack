# 🎯 SpeakTrack

**The open-source habit tracker built for non-native English speakers.**

Track your speaking practice. Record voice notes. Build a personal library of resources. See your progress over time.

## Features

- ✅ **Daily Habit Tracking** — Log shadowing, voice notes, and English conversations
- 🎙️ **Voice Note Journal** — Record yourself, rate performance, listen back
- 📚 **Resource Library** — Save TED talks, podcasts, phrases, and shadowing materials
- 📊 **Progress Dashboard** — Streak counter, calendar heatmap, activity feed
- 🌍 **Open Source (MIT)** — Use it, modify it, contribute

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Ant Design 6
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** SQLite (via libsql adapter)
- **Auth:** NextAuth.js v5 (credentials + JWT)
- **Testing:** Vitest + React Testing Library

## Quick Start

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/berniec/speaktrack.git
cd speaktrack
npm install
cp .env.example .env
# Generate AUTH_SECRET: openssl rand -base64 32
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login
- Email: `demo@speaktrack.app`
- Password: `demo1234`

### Docker

```bash
docker compose up -d
```

## Project Structure

```
app/
├── (auth)/          # Login, register pages
├── (dashboard)/     # Dashboard, daily log, voice, resources
├── api/             # Auth, logs, voice, resources API routes
components/
├── dashboard/       # StatsCards, CalendarHeatmap, RecentActivity
├── layout/          # AppSidebar, UserMenu
├── voice/           # VoiceRecorder, VoiceNoteCard
├── resources/       # ResourceCard, AddResourceModal
└── ui/              # LoadingSkeleton, ErrorDisplay
lib/
├── auth.ts          # NextAuth configuration
├── prisma.ts         # Prisma client singleton
└── antd-provider.tsx # Ant Design registry + config
prisma/
├── schema.prisma    # User, DailyLog, VoiceNote, Resource models
└── seed.ts          # 17 curated resources + demo data
```

## Contributing

Areas for contribution:
- 🌐 i18n / translations
- 📱 Mobile-responsive improvements
- 📊 Additional chart types
- 🔌 OAuth providers (Google, GitHub)
- ☁️ PostgreSQL / cloud deployment guides

## License

MIT — see [LICENSE](LICENSE)
