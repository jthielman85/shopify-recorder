# Etsy Automation

OAuth connection + draft listing creation for your Etsy shop via Open API v3.

## Setup

```bash
cd etsy-automation
npm install
cp .env.example .env
```

Fill in `.env` with the Keystring and Shared Secret from your Etsy developer app page.

## Connect your shop (one-time)

```bash
npm run auth
```

This must be run on the machine whose browser you'll use to approve access — the OAuth
redirect goes to `http://localhost:3001/...`, which only resolves on that same machine.
It opens an authorization URL, waits for the redirect, then saves tokens to
`.tokens.json` and writes `ETSY_SHOP_ID` into `.env` automatically.

## Create a draft listing

```bash
npm run create-draft -- path/to/listing.json
```

`listing.json` shape:

```json
{
  "title": "...",
  "description": "...",
  "price": 24.99,
  "quantity": 10,
  "who_made": "i_did",
  "when_made": "2020_2026",
  "taxonomy_id": 1234,
  "images": ["path/to/mockup1.jpg", "path/to/mockup2.jpg"]
}
```

Listing is always created with `state: draft` — nothing publishes automatically.

## Photoshop mockups

See `photoshop/mockup_automation.jsx`. One-time setup: put it in its own folder
alongside a `mockup.psd` (containing a Smart Object named to match `SO_NAME_MATCH`
in the script). It auto-creates `input/` and `output/` next to itself and runs
dialog-free once `mockup.psd` is present.
