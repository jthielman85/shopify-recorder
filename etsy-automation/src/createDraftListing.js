require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { createDraftListing, uploadListingImage, updateListingInventory } = require('./etsyClient');

const { ETSY_SHOP_ID } = process.env;
const listingJsonPath = process.argv[2];

if (!ETSY_SHOP_ID) {
  console.error('ETSY_SHOP_ID is not set in .env — run `npm run auth` first.');
  process.exit(1);
}
if (!listingJsonPath) {
  console.error('Usage: npm run create-draft -- path/to/listing.json');
  console.error('listing.json shape: { title, description, price, quantity, who_made, when_made, taxonomy_id, images: ["path/to/img.png", ...], sizes: [{ size, price, quantity }, ...] (optional) }');
  process.exit(1);
}

async function main() {
  const listing = JSON.parse(fs.readFileSync(path.resolve(listingJsonPath), 'utf8'));
  const { images = [], sizes = [], ...listingFields } = listing;

  const created = await createDraftListing(ETSY_SHOP_ID, listingFields);
  console.log(`Draft listing created: listing_id ${created.listing_id}`);

  for (let i = 0; i < images.length; i++) {
    await uploadListingImage(ETSY_SHOP_ID, created.listing_id, path.resolve(images[i]), i + 1);
    console.log(`  uploaded image ${i + 1}/${images.length}: ${images[i]}`);
  }

  if (sizes.length > 0) {
    await updateListingInventory(ETSY_SHOP_ID, created.listing_id, sizes);
    console.log(`  added ${sizes.length} size variations`);
  }

  console.log(`\nDone. Review it in Etsy Shop Manager under Draft listings.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
