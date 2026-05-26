# Social Media Scraper Dashboard (SaaS NLP Platform)

A production-ready, highly stylized enterprise-grade **Social Media Scraper & Sentiment Intelligence Dashboard** built as a full-stack monorepo assignment.

The platform continuously harvests public mentions related to passport services (delays, tatkal schemas, visa stamping issues, fraud alert grids) from **7 major social channels**, filters out spambots and keyboard smashes, aggregates sentiment levels and categories, groups similar reports into vector threads using Cosine Similarity vector mathematics, caches multi-lingual translations, and presents them in an interactive glassmorphic dashboard.

---

## 🚀 Key Architectural Features

1. **Automated Scraping Cycles (15 Mins)**: Dual-mode scraper featuring official channel endpoints paired with an intelligent multilingual generator fallback.
2. **Algorithmic Gibberish & Spam Guard**: Character-repetition matches, symbol density quotients, token entropy metrics, and vowel ratios filter out bots.
3. **AI NLP Categorization & Sentiment**: Dynamic floating-point sentiment scale (`-1.0` to `+1.0`) and auto-categorization mapping across 10 specialized categories. OpenAI client ready, paired with high-performance local rule classifiers.
4. **Cosine Similarity Clustering**: Offline Vector Space TF-IDF tokenization that measures text similarity. Scores $\ge 0.70$ group duplicate reports into unified cluster thread cards.
5. **Double-Tier Translation Cache**: On-demand translation supporting 10 languages. Injects translations into Redis (fast temporary TTL hits) and persists permanently in MongoDB records.
6. **Executive Export Hub**: Instant, quote-escaped CSV exports and beautifully styled executive PDF briefs generated using `pdfkit`.

---

## 🛠 Tech Stack

* **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS (Obsidian/Neon Accent Design System) + Lucide Icons + Recharts
* **Backend**: Node.js + Express.js + TypeScript (Modular Repository-Service-Controller Pattern)
* **Database**: MongoDB (Mongoose Schemas with optimized compound text and search indices)
* **Queue/Cache**: Redis
* **Authentication**: JWT Bearer validation
* **AI/NLP**: OpenAI API Integration + Natural / Franc Local NLP Fallbacks

---

## 📂 Project Structure

```
zebvo/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis connections
│   │   ├── controllers/     # Auth, post, analytics, export endpoints
│   │   ├── middlewares/     # JWT authentication, centralized error catcher
│   │   ├── models/          # Mongoose Schemas (User, Post) with search indexes
│   │   ├── routes/          # Express routing tables
│   │   ├── services/        # Scraper, NLP, Cosine Clustering, Redis Caching, PDF Export
│   │   └── utils/           # Database Seeder script
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 15 pages (Login, Dashboard, Analytics, Export, Settings)
│   │   ├── components/      # Glassmorphic Sidebar, Top Navbar layout
│   │   └── lib/             # API client with complete resilient offline mock fallbacks
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Production container orchestration
└── README.md
```

---

## 🔌 API Documentation

All routes except authentication require a `Authorization: Bearer <JWT_TOKEN>` header.

### 🔑 Authentication
* `POST /api/auth/register`: Register new account. Returns token.
* `POST /api/auth/login`: Authenticate admin. Returns token + user profile.
* `GET /api/auth/me`: Verifies active session token.

### 📋 Social Mentions
* `GET /api/posts`: Paginated list query. Supports search and multi-select filter parameters:
  * `page`, `limit`, `search`, `platform`, `category`, `sentiment`, `language`, `gibberish`, `hours`.
* `GET /api/posts/:id`: Get detailed post model document.
* `POST /api/posts/:id/translate`: Trigger translation. Body: `{ "lang": "hi" }`.
* `GET /api/posts/cluster/:clusterId`: Retrieve linked similarity threads.

### 📊 Analytics & Reporting
* `GET /api/analytics`: Single-pass MongoDB facets calculating sentiment pie-charts, platform bar distributions, category radars, regional heatmaps, top influencers, and keyword clouds.

### 💾 File Exporting
* `GET /api/exports/csv`: Compiles matching posts based on current filters into structured CSV.
* `GET /api/exports/pdf`: Generates designed executive PDF report stream.

---

## 🐳 Quick Start: Docker Compose

Boot up the entire stack (MongoDB, Redis, Express Backend, Next.js Frontend) in one command:

```bash
docker-compose up --build
```
* **Frontend Dashboard**: `http://localhost:3000`
* **REST Express API**: `http://localhost:5000`
* **MongoDB Store**: `mongodb://localhost:27017`
* **Redis Cache**: `redis://localhost:6379`

---

## 💻 Manual Local Installation

### Prerequisites
* Node.js v18 or v20+
* MongoDB Server (local or Atlas URI)
* Redis Server (optional, falls back gracefully to local maps)

### 1. Set Up Express Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/zebvo_scraper
REDIS_URL=redis://localhost:6379
JWT_SECRET=production_level_jwt_secret_zebvo_2026
OPENAI_API_KEY=mock_mode # Or insert real OpenAI key
SCRAPE_INTERVAL_MINUTES=15
```

Seed the database with default administrator (`admin@zebvo.com` / `password123`) and 100+ realistic passport posts:
```bash
npm run seed
```

Start in development mode:
```bash
npm run dev
```

### 2. Set Up Next.js Frontend
```bash
cd ../frontend
npm install --legacy-peer-deps
```

Create a `.env` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the development server:
```bash
npm run dev
```

---

## 🔐 Credentials Checklist for review
To review the SaaS system immediately without launching external databases, the **Frontend has dual-mode resilience enabled**. Use the following bypass profile to log in and interact with rich mock visualizations out-of-the-box:
* **Username/Email**: `admin`
* **Password**: `password123`
