require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { updateListingInventory } = require('./etsyClient');

const { ETSY_SHOP_ID } = process.env;
const listingId = process.argv[2];
const sizesJsonPath = process.argv[3];

if (!ETSY_SHOP_ID) {
  console.error('ETSY_SHOP_ID is not set in .env — run `npm run auth` first.');
  process.exit(1);
}
if (!listingId || !sizesJsonPath) {
  console.error('Usage: npm run add-sizes -- <listing_id> path/to/sizes.json');
  console.error('sizes.json shape: [{ "size": "5x7", "price": 30.80, "quantity": 10 }, ...]');
  process.exit(1);
}

async function main() {
  const sizes = JSON.parse(fs.readFileSync(path.resolve(sizesJsonPath), 'utf8'));
  await updateListingInventory(ETSY_SHOP_ID, listingId, sizes);
  console.log(`Added ${sizes.length} size variations to listing ${listingId}.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
