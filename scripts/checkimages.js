const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const products = await p.product.findMany({
    include: { images: true },
    take: 5,
  });

  console.log('\n=== PRODUCTS & IMAGES ===');
  products.forEach(prod => {
    console.log(`\nProduct: ${prod.title}`);
    console.log(`  Status: ${prod.status}`);
    console.log(`  Images (${prod.images.length}):`);
    prod.images.forEach(img => {
      console.log(`    - ${img.url}`);
    });
  });

  const settings = await p.websiteSetting.findMany({
    where: { key: { in: ['hero_bg_image', 'active_theme_id'] } }
  });
  console.log('\n=== RELEVANT SETTINGS ===');
  settings.forEach(s => {
    const val = s.value.length > 100 ? s.value.substring(0, 100) + '...' : s.value;
    console.log(`  ${s.key}: ${val}`);
  });

  await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });
