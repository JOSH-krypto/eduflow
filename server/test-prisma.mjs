import pkg from './dist/db.js';
const prisma = pkg.default || pkg.prisma || pkg;

async function main() {
  try {
    console.log("Connecting via PrismaNeon adapter in db.ts...", typeof prisma, Object.keys(prisma));
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, planTier: true }
    });
    console.log("PRISMA SUCCESS! Users found in Neon:", users);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    if (prisma.$disconnect) await prisma.$disconnect();
  }
}

main();
