# Layover

Layover books overnight buses between Indian cities, then offers two companions for the trip.

- **MingleBuddy** is a private chat for people on the same departure, with a request to sit together.
- **TravelBuddy** books a hotel, builds a timed itinerary, and answers from the city notes. The same guide covers amenities such as a currency exchange or a local restaurant.

Fares are in INR. The payment screen is a template and does not charge a card. Seats stay unassigned until 06:00 on the morning of travel.

## Requirements

- Node.js 22
- npm
- Docker, for a local Postgres 16 database
- A Gemini API key, for TravelBuddy replies
- Python 3.11, only if you run the optional OKF converter

Node packages and their locked versions are listed in `requirements.txt`. Install them with `npm install`. The Python converter uses only the standard library.

## Setup

```powershell
npm install
copy .env.example .env.local
```

Put your Gemini key in `.env.local`. That file is gitignored.

Start Postgres:

```powershell
docker run -d --name layover-pg -e POSTGRES_USER=layover -e POSTGRES_PASSWORD=layover -e POSTGRES_DB=layover -p 5433:5432 postgres:16
```

If the container already exists, start it with `docker start layover-pg`.

```powershell
npm run dev
```

Open http://localhost:5173. Accounts, tickets, and chats are stored in this browser and written to Postgres when the database is up. Tables are created on the first save.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 5173 |
| `npm run build` | Production build in `dist` |
| `npm run preview` | Serves the production build and the API routes |

Regenerate the TravelBuddy city notes with:

```powershell
node scripts/write-okf.mjs
```

The optional Kochi spot converter is:

```powershell
python okf/travelbuddy/okf_convertor.py
```

## Environment

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-side key for TravelBuddy replies |
| `DATABASE_URL` | Postgres URL for profiles, tickets, MingleBuddy chats, guide chats, and amenities |

Copy `.env.example` to `.env.local` for local work. Set the same names in the host's environment for a deploy. Do not commit real keys.

## Deploy

The guide (`/api/guide`) and the database (`/api/db`) run inside the Vite server. Host the app on a Node service such as Render.

- Build: `npm install && npm run build`
- Start: `npx vite preview --host 0.0.0.0 --port $PORT`
- Environment: `GEMINI_API_KEY` and `DATABASE_URL`

Use a hosted Postgres database for the deployed site. The local Docker database is only reachable from your machine.

## Project layout

- `src/` React app: booking, MingleBuddy, and TravelBuddy
- `server/db.mjs` Postgres schema and saves
- `okf/travelbuddy/` city notes the guide retrieves
- `vite.config.js` Gemini and database routes
