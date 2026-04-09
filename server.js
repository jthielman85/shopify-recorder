const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_DIR = path.join(__dirname, 'db');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');
const EVENTS_DIR = path.join(DB_DIR, 'events');

[DB_DIR, EVENTS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

function loadSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')); } catch { return {}; }
}
function saveSessions(data) { fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data), 'utf8'); }
function appendEvents(sessionId, events) {
  const file = path.join(EVENTS_DIR, `${sessionId}.json`);
  let existing = [];
  if (fs.existsSync(file)) { try { existing = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {} }
  existing.push(...events);
  fs.writeFileSync(file, JSON.stringify(existing), 'utf8');
  return existing.length;
}
function loadEvents(sessionId) {
  const file = path.join(EVENTS_DIR, `${sessionId}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function deleteSessionData(sessionId) {
  const sessions = loadSessions();
  delete sessions[sessionId];
  saveSessions(sessions);
  const file = path.join(EVENTS_DIR, `${sessionId}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

app.use(compression());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/track', (req, res) => {
  const { sessionId, events, meta } = req.body;
  if (!sessionId || !events || !Array.isArray(events)) return res.status(400).json({ error: 'Invalid payload' });
  const now = Date.now();
  const sessions = loadSessions();
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      id: sessionId, shop_url: meta?.shopUrl || '', page_url: meta?.pageUrl || '',
      user_agent: meta?.userAgent || '', screen_width: meta?.screenWidth || 0,
      screen_height: meta?.screenHeight || 0, started_at: meta?.startedAt || now,
      last_updated: now, event_count: 0, duration: 0
    };
  }
  const totalEvents = appendEvents(sessionId, events);
  sessions[sessionId].last_updated = now;
  sessions[sessionId].event_count = totalEvents;
  sessions[sessionId].duration = Math.round((now - sessions[sessionId].started_at) / 1000);
  saveSessions(sessions);
  res.json({ ok: true });
});

app.get('/api/sessions', (req, res) => {
  const sessions = loadSessions();
  const list = Object.values(sessions).sort((a, b) => b.last_updated - a.last_updated).slice(0, 100);
  res.json({ sessions: list, total: list.length });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = loadSessions()[req.params.id];
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json({ ...session, events: loadEvents(req.params.id) });
});

app.delete('/api/sessions/:id', (req, res) => { deleteSessionData(req.params.id); res.json({ ok: true }); });

app.get('/api/stats', (req, res) => {
  const list = Object.values(loadSessions());
  const today = list.filter(s => s.started_at > Date.now() - 86400000).length;
  const avgDuration = list.length ? Math.round(list.reduce((s, x) => s + (x.duration || 0), 0) / list.length) : 0;
  const pageCounts = {};
  list.forEach(s => { if (s.page_url) pageCounts[s.page_url] = (pageCounts[s.page_url] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([page_url,visits]) => ({page_url,visits}));
  res.json({ total: list.length, today, avgDuration, topPages });
});

app.listen(PORT, () => {
  console.log(`\n🎥  Shopify Session Recorder`);
  console.log(`    Server:    http://localhost:${PORT}`);
  console.log(`    Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`    Track URL: http://localhost:${PORT}/track\n`);
});
