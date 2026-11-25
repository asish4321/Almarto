const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Show current stock
  const products = await p.product.findMany({
    select: { id: true, title: true, stock: true, status: true }
  });

  console.log('\n=== CURRENT STOCK ===');
  products.forEach(pr => {
    console.log(`${pr.title.substring(0, 40)} | stock: ${pr.stock} | status: ${pr.status}`);
  });

  // Fix: set minimum stock of 10 for all PUBLISHED products with 0 stock
  const fixed = await p.product.updateMany({
    where: { stock: { lte: 0 }, status: 'PUBLISHED' },
    data: { stock: 10 },
  });

  console.log(`\n✓ Restored stock to 10 for ${fixed.count} out-of-stock product(s)`);

  // Also clear any variant stock issues
  const variantFixed = await p.productVariant.updateMany({
    where: { stock: { lte: 0 } },
    data: { stock: 10 },
  });
  console.log(`✓ Restored variant stock for ${variantFixed.count} variant(s)`);

  // Show after
  const after = await p.product.findMany({
    select: { title: true, stock: true }
  });
  console.log('\n=== AFTER FIX ===');
  after.forEach(pr => {
    console.log(`${pr.title.substring(0, 40)} | stock: ${pr.stock}`);
  });
}

main().finally(() => p.$disconnect());
