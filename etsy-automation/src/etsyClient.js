require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { getAccessToken } = require('./tokenStore');

const API_BASE = 'https://api.etsy.com/v3/application';
const { ETSY_API_KEY, ETSY_SHARED_SECRET } = process.env;
const API_KEY_HEADER = `${ETSY_API_KEY}:${ETSY_SHARED_SECRET}`;

async function authedFetch(url, options = {}) {
  const tokens = await getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': API_KEY_HEADER,
      Authorization: `Bearer ${tokens.access_token}`,
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Etsy API error (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

async function createDraftListing(shopId, listing) {
  return authedFetch(`${API_BASE}/shops/${shopId}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...listing, state: 'draft' })
  });
}

async function uploadListingImage(shopId, listingId, imagePath, rank) {
  const tokens = await getAccessToken();
  const form = new FormData();
  form.append('image', new Blob([fs.readFileSync(imagePath)]), path.basename(imagePath));
  if (rank !== undefined) form.append('rank', String(rank));

  const res = await fetch(`${API_BASE}/shops/${shopId}/listings/${listingId}/images`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY_HEADER, Authorization: `Bearer ${tokens.access_token}` },
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Image upload error (${res.status}): ${JSON.stringify(data)}`);
  return data;
}

async function updateListingInventory(shopId, listingId, sizeOfferings) {
  const products = sizeOfferings.map(({ size, price, quantity }) => ({
    sku: size,
    property_values: [
      {
        property_name: 'Size',
        values: [size]
      }
    ],
    offerings: [
      {
        price,
        quantity,
        is_enabled: true
      }
    ]
  }));

  return authedFetch(`${API_BASE}/shops/${shopId}/listings/${listingId}/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products })
  });
}

module.exports = { createDraftListing, uploadListingImage, updateListingInventory };
