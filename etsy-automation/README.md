# Etsy Draft Listing Tool

One-time setup, then the day-to-day workflow happens in chat with Claude — no dashboard, no scripts to run yourself.

## One-time setup

1. `cp .env.example .env` and fill in `ETSY_API_KEY` / `ETSY_SHARED_SECRET` from your Etsy developer app
2. `npm install`
3. `npm run auth` — opens a link, you log in as your shop and approve access once. Saves your shop ID and tokens automatically.

That's it. Tokens auto-refresh after this — you never repeat step 3 unless you revoke access.

## Day-to-day workflow

You don't touch the CLI directly. In chat:

1. Send Claude a listing URL you think is a winner
2. Claude generates an altered design (Higgsfield) and a mockup, shows them to you
3. You approve or ask for changes
4. Claude fills in `listing.example.json`-shaped data and runs `npm run create-draft` behind the scenes
5. You get a link to the **draft** listing in Etsy — review and publish it yourself whenever you're ready

Nothing publishes automatically. Every listing sits as a draft until you personally hit publish in Etsy.

## Files

| File | Purpose |
|---|---|
| `src/oauth.js` | One-time OAuth authorization (`npm run auth`) |
| `src/tokenStore.js` | Reads/refreshes saved tokens automatically |
| `src/etsyClient.js` | Create draft listings, upload images |
| `src/createDraftListing.js` | CLI entry point, takes a listing JSON file |
| `listing.example.json` | Shape of the JSON `createDraftListing.js` expects |
