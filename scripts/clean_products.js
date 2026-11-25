const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Removing all existing product cards and related records ---');
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  const deleted = await prisma.product.deleteMany({});
  console.log(`Successfully removed ${deleted.count} existing products.`);
}

main()
  .catch((e) => {
    console.error('Error cleaning products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
