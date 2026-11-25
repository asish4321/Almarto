const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking existing categories ---');
  const cats = await prisma.category.findMany({
    include: { _count: { select: { products: true, subcategories: true } } },
  });
  console.log('Found categories:', cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, products: c._count.products })));

  const slugsToDelete = [
    'paint-your-own-vinyl',
    'diy-mystery-blind-boxes',
    'miniature-pop-dioramas',
    'pop-brick-mech-kits',
    'pop-beads-craft-studio',
    'sensory-fidget-diys',
  ];

  console.log('--- Deleting categories ---');
  for (const slug of slugsToDelete) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) {
      // Find products in this category
      const products = await prisma.product.findMany({ where: { categoryId: cat.id }, select: { id: true } });
      const pIds = products.map((p) => p.id);
      if (pIds.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.productVariant.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.inventory.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.cartItem.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.wishlistItem.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.review.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.orderItem.deleteMany({ where: { productId: { in: pIds } } });
        await prisma.product.deleteMany({ where: { id: { in: pIds } } });
      }
      await prisma.subcategory.deleteMany({ where: { categoryId: cat.id } });
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`Successfully deleted category: ${cat.name} (${cat.slug})`);
    }
  }

  const remaining = await prisma.category.findMany();
  console.log('Remaining categories in database:', remaining.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
