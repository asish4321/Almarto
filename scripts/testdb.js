const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ log: ['error', 'warn'] });

async function main() {
  console.log('Testing DB connection...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':***@'));
  try {
    const result = await p.$queryRawUnsafe('SELECT 1 as ok');
    console.log('DB OK:', JSON.stringify(result));
    
    const count = await p.websiteSetting.count();
    console.log('WebsiteSetting rows:', count);
    
    const products = await p.product.count();
    console.log('Product rows:', products);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    console.error('Error code:', e.code);
  } finally {
    await p.$disconnect();
  }
}

main();
