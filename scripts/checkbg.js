const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const r = await p.websiteSetting.findUnique({ where: { key: 'hero_bg_image' } });
  if (!r) { console.log('hero_bg_image: NOT FOUND in DB'); }
  else {
    console.log('hero_bg_image found, length:', r.value.length);
    console.log('Start:', r.value.substring(0, 120));
  }
}
main().finally(() => p.$disconnect());
