# Al-Quran Backend API

> Node.js · Express · TypeScript · Swagger UI · OpenAPI

A production-ready REST API serving Quran data — Arabic text (Uthmani script) and English translation (Muhammad Asad). Data is fetched from the AlQuran.cloud public API and cached server-side for 24 hours to ensure fast responses.

---

## ✨ Features

- **All 114 Surahs** — metadata including Arabic name, English name, translation, revelation type, ayah count
- **Full Ayah Data** — Arabic text (Uthmani), English translation, Juz, Page, Ruku, Hizb, Sajda flag
- **Full-text Search** — search across all 6,236 ayahs in translation with pagination
- **24-hour Caching** — `node-cache` prevents redundant upstream API calls
- **Swagger UI** — interactive API documentation at `/api-docs`
- **Rate Limiting** — 200 req/15min general, 30 req/min for search
- **Global Error Handling** — structured JSON error responses with Zod validation
- **Request Logging** — Winston logger with file and console transports
- **Security** — Helmet, CORS, input sanitisation via Zod schemas
- **Graceful Shutdown** — handles `SIGTERM` / `SIGINT`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| API Docs | Swagger UI Express + swagger-jsdoc (OpenAPI 3.0) |
| Caching | node-cache (24h TTL) |
| Validation | Zod |
| HTTP Client | Axios (with retry logic) |
| Logging | Winston |
| Security | Helmet, express-rate-limit, CORS |
| Data Source | AlQuran.cloud API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
.env

# 3. Start development server (with hot reload)
npm run dev
# → API:       https://quran-web-backend-rashaduldev.vercel.app
# → Swagger:   https://quran-web-backend-rashaduldev.vercel.app/api-docs
# → Health:    https://quran-web-backend-rashaduldev.vercel.app/health
```

### Production Build

```bash
npm run build    # Compiles TypeScript → /dist
npm start        # Runs compiled output
```

---

## 📡 API Endpoints

### Surahs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/surahs` | All 114 surahs (metadata only) |
| `GET` | `/api/surahs/:id` | Surah detail with all ayahs + translations |
| `GET` | `/api/surahs/:id/ayahs` | Only the ayahs array for a surah |

**Parameters:** `:id` — Surah number between `1` and `114`

### Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q={query}` | Search in English translation |

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | required | Search query (min 2 chars) |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page (max 50) |

### Utility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check with uptime |
| `GET` | `/api/cache/stats` | Cache hit/miss statistics |
| `DELETE` | `/api/cache/clear` | Flush all cached data |
| `GET` | `/api-docs` | Swagger UI |
| `GET` | `/api-docs.json` | Raw OpenAPI JSON spec |

---

## 📦 Response Format

### Success

```json
{
  "success": true,
  "data": { ... },
  "total": 114
}
```

### Error

```json
{
  "success": false,
  "error": "Surah ID must be between 1 and 114"
}
```

### Search Response

```json
{
  "success": true,
  "data": [
    {
      "surahNumber": 2,
      "surahName": "سُورَةُ البَقَرَةِ",
      "surahEnglishName": "Al-Baqara",
      "ayahNumber": 255,
      "ayahNumberInSurah": 255,
      "arabicText": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ...",
      "translation": "God - there is no deity save Him..."
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 3,
  "query": "mercy"
}
```

## 🐳 Docker

```bash
# Build image
docker build -t quran-api .

# Run container
docker run -p 5000:5000 -e NODE_ENV=production quran-api

# Or via docker-compose (from root)
docker-compose up backend
```

---

## 📊 Swagger UI

Interactive API docs are available at `/api-docs` when the server is running. The spec includes:

- Full request/response schemas for all endpoints
- Example values for every field
- Try-it-out functionality for live testing
- Component schemas for `Surah`, `Ayah`, `SurahDetail`, `SearchResult`, `Error`

---

## 📝 Data Sources

| Edition | Identifier | Description |
|---|---|---|
| Arabic | `quran-uthmani` | Uthmani script with full diacritics |
| Translation | `en.asad` | Muhammad Asad — *The Message of The Quran* |

Both editions are sourced from [AlQuran.cloud](https://alquran.cloud/api) — a free, open Quran API.
