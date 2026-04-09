# 🎥 Shopify Session Recorder

A self-hosted session recording tool for your Shopify store — like Hotjar but yours to own.

---

## What It Does
- Records mouse movements, clicks, scrolls, and DOM changes on your Shopify store
- Stores sessions in a local SQLite database
- Replays sessions in a built-in dashboard
- Masks all sensitive inputs (passwords, emails, card numbers)

---

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

The server runs on **http://localhost:3000**
Dashboard is at **http://localhost:3000/dashboard.html**

---

### 3. Deploy to the internet (so Shopify can reach it)

You need a public URL for your backend. Easiest options:

**Option A — Railway (free tier)**
1. Push this folder to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Railway gives you a public URL like `https://your-app.railway.app`

**Option B — Render (free tier)**
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set start command to `npm start`

**Option C — Quick test with ngrok**
```bash
npx ngrok http 3000
# Copy the https URL it gives you
```

---

### 4. Install the tracker on Shopify

1. Go to **Shopify Admin → Online Store → Themes → Edit Code**
2. Open **Layout → theme.liquid**
3. Open `shopify-snippet.js` from this folder
4. Copy the `<script>` block (everything between the `/* */` comment markers)
5. Paste it just before `</head>` in theme.liquid
6. Replace `YOUR_BACKEND_URL` with your deployed server URL
7. Save

---

## Dashboard Features

| Feature | Description |
|---|---|
| Session list | All recorded sessions with event count and duration |
| Session replay | Full playback with speed controls (1x, 2x, 4x, 8x) |
| Stats | Total, today's count, average session duration |
| Search | Filter sessions by URL or ID |
| Delete | Remove individual sessions |

---

## Privacy & GDPR

The tracker automatically:
- Masks all password and email inputs
- Does NOT record payment fields (Shopify handles these in iframes)
- Does NOT send data to any third party — everything stays on your server

**Recommended:** Add a note to your Privacy Policy that you record session activity.

To mask additional elements, add `class="no-record"` to any HTML element.

---

## Project Structure

```
shopify-recorder/
├── server.js            ← Express backend
├── public/
│   └── dashboard.html   ← Replay dashboard
├── shopify-snippet.js   ← Code to paste into theme.liquid
├── db/
│   └── sessions.db      ← SQLite database (auto-created)
└── package.json
```

---

## Tech Stack

- **rrweb** — open-source session recording engine
- **Express** — Node.js backend
- **better-sqlite3** — fast local database
- **rrweb-player** — session replay UI
