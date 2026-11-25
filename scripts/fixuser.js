const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Show all users and their blocked/active status
  const users = await p.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, isBlocked: true }
  });
  
  console.log('\n=== ALL USERS ===');
  users.forEach(u => {
    console.log(`${u.email} | role: ${u.role} | isActive: ${u.isActive} | isBlocked: ${u.isBlocked}`);
  });

  // Fix: unblock and activate all users
  const result = await p.user.updateMany({
    data: { isBlocked: false, isActive: true }
  });
  
  console.log(`\n✓ Fixed ${result.count} user(s) — set isBlocked=false, isActive=true`);
  
  // Verify
  const after = await p.user.findMany({
    select: { email: true, isActive: true, isBlocked: true }
  });
  console.log('\n=== AFTER FIX ===');
  after.forEach(u => {
    console.log(`${u.email} | isActive: ${u.isActive} | isBlocked: ${u.isBlocked}`);
  });
}

main().finally(() => p.$disconnect());
