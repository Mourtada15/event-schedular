# Event Scheduler Application (Version 5)

Production-ready monorepo app for scheduling events with authentication, invitation links, search/filtering, status tracking, and integrated AI assistant tools.

## Repo Structure

- `/server` - Node.js + Express API + MongoDB (Mongoose)
- `/client` - React (Vite) + Bootstrap 5 frontend

## Features Checklist

### Core Requirements
- [x] Monorepo with `/server` and `/client`
- [x] JavaScript-only implementation (no TypeScript)
- [x] JWT auth with access + refresh cookies (httpOnly)
- [x] CSRF protection using double-submit token strategy
- [x] Security middleware: `helmet`, `cors` (credentials), rate limit, mongo sanitize
- [x] Input validation via `zod`
- [x] Consistent JSON API shape: `{ ok, data | error }`

### Auth
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`
- [x] `POST /api/auth/logout`
- [x] `GET /api/auth/me`
- [x] `POST /api/auth/refresh` with refresh rotation

### Events
- [x] Create, read, update, delete events
- [x] Ownership enforcement (users can only access their own events)
- [x] Status tracking (`upcoming`, `attending`, `maybe`, `declined`)
- [x] Search + filters + sort + pagination
- [x] MongoDB indexes for performant event queries

### Invitations
- [x] Invite token link generation
- [x] Optional SMTP email sending (Nodemailer)
- [x] Invite accept flow for logged-in users or new account creation

### AI Assistant
- [x] Improve Description
- [x] Generate Agenda
- [x] Smart Suggestions
- [x] Conflict Check (bonus)
- [x] Pluggable AI provider:
  - Uses OpenAI API when `OPENAI_API_KEY` is configured
  - Falls back to deterministic local stub when key is absent
- [x] AI usage logs stored in MongoDB (`AIUsage`)

### Frontend
- [x] Auth (Login/Register)
- [x] Dashboard with event list, filters, search, pagination
- [x] Event create/edit form with AI assistant sidebar
- [x] Event details page
- [x] Invitations (create + copy link) page
- [x] Accept invite page
- [x] Navbar, loading states, empty states, toast notifications
- [x] Axios with `withCredentials: true` and 401 refresh retry handling

## API Summary

Base URL: `/api`

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/register { name, email, password }`
- `POST /api/auth/login { email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Events (auth required)
- `GET /api/events?query=&status=&from=&to=&location=&tags=tag1,tag2&page=&limit=&sort=`
- `POST /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Invitations
- `POST /api/invites/create { email? }` (auth required)
- `POST /api/invites/accept { token, name, password, email? }` (supports logged-in or new account flow)

### AI (auth required)
- `POST /api/ai/improve-description { title, description }`
- `POST /api/ai/generate-agenda { title, startAt, endAt, attendeesCount? }`
- `POST /api/ai/smart-suggestions { title, location?, description? }`
- `POST /api/ai/conflict-check { startAt, endAt }`

## Data Models

- `User`: `name`, `email` (unique), `passwordHash`, `role`, `invitedBy`, `createdAt`
- `RefreshToken`: `userId`, `tokenHash`, `expiresAt`, `createdAt`
- `Event`: `ownerId`, `title`, `startAt`, `endAt`, `location`, `description`, `status`, `tags`, timestamps
- `Invitation`: `inviterId`, `email?`, `tokenHash`, `expiresAt`, `acceptedAt`, `createdAt`
- `AIUsage`: `userId`, `feature`, `createdAt`

## Indexing

- `User`: unique index on `email`
- `Event`: compound index on `ownerId + startAt`
- `Event`: text index on `title + location + description`
- `Invitation`: index on `tokenHash`
- `Invitation`: TTL index on `expiresAt`
- `RefreshToken`: TTL index on `expiresAt`

## Local Setup

## 1) Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or cloud)

## 2) Clone and install

```bash
git clone <your-repo-url>
cd event-scheduler-monorepo
npm run install:all
```

## 3) Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` and `client/.env` values as needed.

## 4) Run development servers

Terminal A:
```bash
npm run dev:server
```

Terminal B:
```bash
npm run dev:client
```

- API: `http://localhost:5000/api`
- Frontend: `http://localhost:5173`

## Environment Variables

### Server (`server/.env`)
- `NODE_ENV` (`development` or `production`)
- `PORT` (e.g. `5000`)
- `MONGO_URI`
- `CLIENT_ORIGIN` (Vercel URL in prod, local URL in dev)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL` (default `15m`)
- `REFRESH_TOKEN_TTL_DAYS` (default `7`)
- `COOKIE_SECURE` (`true` in production)
- `OPENAI_API_KEY` (optional)
- `SMTP_HOST` (optional)
- `SMTP_PORT` (optional)
- `SMTP_USER` (optional)
- `SMTP_PASS` (optional)
- `SMTP_FROM` (optional)
- `INVITE_TOKEN_TTL_HOURS` (default `168`)

### Client (`client/.env`)
- `VITE_API_BASE_URL` (e.g. `http://localhost:5000/api` locally, Render URL in prod)

## Deployment

## Render (Server)

1. Create a new Render Web Service from the `/server` directory.
2. Build command:
   ```bash
   npm install
   ```
3. Start command:
   ```bash
   npm start
   ```
4. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (or Render default)
   - `MONGO_URI=<your_mongodb_uri>`
   - `CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app`
   - `JWT_ACCESS_SECRET=<strong_secret>`
   - `JWT_REFRESH_SECRET=<strong_secret>`
   - `COOKIE_SECURE=true`
   - `OPENAI_API_KEY=<optional>`
   - `SMTP_*` variables (optional)

## Vercel (Client)

1. Import the repo and set root directory to `/client`.
2. Set env var:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`
3. Deploy.

## Cross-site cookies for Vercel <-> Render

- Server CORS uses:
  - `origin = CLIENT_ORIGIN`
  - `credentials = true`
- Axios uses `withCredentials: true`
- In production cookies are set with:
  - `SameSite=None`
  - `Secure=true`

## Quick Sanity Test (curl)

Use a cookie jar so auth cookies persist.

### Health
```bash
curl -i http://localhost:5000/api/health
```

### Register
```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"password123"}' \
  http://localhost:5000/api/auth/register
```

### Fetch current user
```bash
curl -i -b cookies.txt http://localhost:5000/api/auth/me
```

### Create event (with CSRF header)
1) Get CSRF token value from `cookies.txt` (`csrfToken`).
2) Call:
```bash
curl -i -b cookies.txt -H "x-csrf-token: <csrfToken>" -H "Content-Type: application/json" \
  -d '{"title":"Team Sync","startAt":"2026-03-01T10:00:00.000Z","endAt":"2026-03-01T11:00:00.000Z","location":"Room A","description":"Weekly sync","status":"upcoming","tags":["team"]}' \
  http://localhost:5000/api/events
```

## Demo Flow

1. Register first account and create a few events.
2. Open event create/edit page and use AI panel buttons.
3. Create an invitation and copy link.
4. Open invite link in incognito and accept invite with a new account.
5. Login as invited account and manage events.

## Example Credentials (Local)

- User 1: `owner@example.com` / `password123`
- User 2: `guest@example.com` / `password123`

## Notes

- If `OPENAI_API_KEY` is not configured, AI endpoints still work via deterministic local stub responses.
- SMTP is optional. Invite links are always generated and can be copied manually.
