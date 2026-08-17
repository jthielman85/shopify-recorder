require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(__dirname, '..', '.tokens.json');
const TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';
const { ETSY_API_KEY } = process.env;

function readTokens() {
  if (!fs.existsSync(TOKENS_PATH)) {
    throw new Error('No .tokens.json found. Run `npm run auth` first.');
  }
  return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
}

function writeTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

async function refresh(tokens) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ETSY_API_KEY,
      refresh_token: tokens.refresh_token
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  const updated = { ...tokens, ...data, obtained_at: Date.now() };
  writeTokens(updated);
  return updated;
}

async function getAccessToken() {
  let tokens = readTokens();
  const ageSeconds = (Date.now() - tokens.obtained_at) / 1000;
  const isExpiringSoon = ageSeconds > tokens.expires_in - 120;
  if (isExpiringSoon) tokens = await refresh(tokens);
  return tokens;
}

module.exports = { getAccessToken };
