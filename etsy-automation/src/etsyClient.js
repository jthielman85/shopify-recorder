require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const { getAccessToken } = require('./tokenStore');

const API_BASE = 'https://api.etsy.com/v3/application';
const { ETSY_API_KEY, ETSY_SHOP_ID } = process.env;

async function authHeaders() {
  const tokens = await getAccessToken();
  return { 'x-api-key': ETSY_API_KEY, Authorization: `Bearer ${tokens.access_token}` };
}

async function createDraftListing(listing) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/shops/${ETSY_SHOP_ID}/listings`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'draft', ...listing })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Create draft listing failed: ${JSON.stringify(data)}`);
  return data;
}

async function uploadListingImage(listingId, imagePath, rank) {
  const headers = await authHeaders();
  const form = new FormData();
  form.append('image', new Blob([fs.readFileSync(imagePath)]), require('path').basename(imagePath));
  if (rank != null) form.append('rank', String(rank));
  const res = await fetch(`${API_BASE}/shops/${ETSY_SHOP_ID}/listings/${listingId}/images`, {
    method: 'POST',
    headers,
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Image upload failed: ${JSON.stringify(data)}`);
  return data;
}

module.exports = { createDraftListing, uploadListingImage };
