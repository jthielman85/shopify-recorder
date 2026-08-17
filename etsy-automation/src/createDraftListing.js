const fs = require('fs');
const path = require('path');
const { createDraftListing, uploadListingImage } = require('./etsyClient');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run create-draft -- path/to/listing.json');
  console.error('See listing.example.json for the expected shape.');
  process.exit(1);
}

const listing = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const { images = [], ...listingFields } = listing;

(async () => {
  const created = await createDraftListing(listingFields);
  console.log(`Draft created: listing_id ${created.listing_id} (state: ${created.state})`);

  for (let i = 0; i < images.length; i++) {
    const imagePath = path.resolve(path.dirname(inputPath), images[i]);
    await uploadListingImage(created.listing_id, imagePath, i + 1);
    console.log(`  uploaded image ${i + 1}/${images.length}`);
  }

  console.log(`\nReview it here: https://www.etsy.com/your/shops/me/listing-editor/edit/${created.listing_id}`);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
