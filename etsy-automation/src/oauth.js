require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const TOKENS_PATH = path.join(__dirname, '..', '.tokens.json');
const TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';
const SCOPES = ['listings_r', 'listings_w', 'shops_r'];

const { ETSY_API_KEY, ETSY_SHARED_SECRET, ETSY_REDIRECT_URI } = process.env;

if (!ETSY_API_KEY || !ETSY_SHARED_SECRET || !ETSY_REDIRECT_URI) {
  console.error('Missing ETSY_API_KEY, ETSY_SHARED_SECRET, or ETSY_REDIRECT_URI. Copy .env.example to .env and fill it in first.');
  process.exit(1);
}

const redirect = new URL(ETSY_REDIRECT_URI);
const port = Number(redirect.port) || 80;

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const codeVerifier = base64url(crypto.randomBytes(48));
const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest());
const state = base64url(crypto.randomBytes(16));

const authorizeUrl = new URL('https://www.etsy.com/oauth/connect');
authorizeUrl.searchParams.set('response_type', 'code');
authorizeUrl.searchParams.set('client_id', ETSY_API_KEY);
authorizeUrl.searchParams.set('redirect_uri', ETSY_REDIRECT_URI);
authorizeUrl.searchParams.set('scope', SCOPES.join(' '));
authorizeUrl.searchParams.set('state', state);
authorizeUrl.searchParams.set('code_challenge', codeChallenge);
authorizeUrl.searchParams.set('code_challenge_method', 'S256');

async function exchangeCode(code) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ETSY_API_KEY,
      redirect_uri: ETSY_REDIRECT_URI,
      code,
      code_verifier: codeVerifier
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data;
}

async function fetchShopId(accessToken, userId) {
  const res = await fetch(`https://api.etsy.com/v3/application/users/${userId}/shops`, {
    headers: { 'x-api-key': `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`, Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Shop lookup failed: ${JSON.stringify(data)}`);
  return data.shop_id;
}

function persistEnvShopId(shopId) {
  let contents = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  if (/^ETSY_SHOP_ID=.*$/m.test(contents)) {
    contents = contents.replace(/^ETSY_SHOP_ID=.*$/m, `ETSY_SHOP_ID=${shopId}`);
  } else {
    contents += `\nETSY_SHOP_ID=${shopId}\n`;
  }
  fs.writeFileSync(ENV_PATH, contents);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname !== redirect.pathname) {
    res.writeHead(404).end();
    return;
  }

  const returnedState = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Etsy returned an error: ${error}`);
    console.error('Authorization denied:', error);
    server.close(() => process.exit(1));
    return;
  }
  if (returnedState !== state) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('State mismatch — possible CSRF, aborting.');
    console.error('State mismatch, aborting.');
    server.close(() => process.exit(1));
    return;
  }

  try {
    const tokens = await exchangeCode(code);
    const userId = tokens.access_token.split('.')[0];
    const shopId = await fetchShopId(tokens.access_token, userId);

    fs.writeFileSync(TOKENS_PATH, JSON.stringify({
      ...tokens,
      user_id: userId,
      shop_id: shopId,
      obtained_at: Date.now()
    }, null, 2));
    persistEnvShopId(shopId);

    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Authorized. You can close this tab and return to the terminal.');
    console.log(`Success. Shop ID ${shopId} saved to .env and tokens saved to .tokens.json`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Token exchange failed, check the terminal.');
    console.error(err.message);
  } finally {
    server.close(() => process.exit(0));
  }
});

server.listen(port, () => {
  console.log('Open this URL, log in as your shop, and approve access:\n');
  console.log(authorizeUrl.toString());
  console.log(`\nWaiting for the redirect on ${ETSY_REDIRECT_URI} ...`);
});
