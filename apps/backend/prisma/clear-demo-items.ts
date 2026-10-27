import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_TITLES = [
  'Apple AirPods Pro (2nd Gen) in White Case',
  'Casio Scientific Calculator fx-991EX',
  'Student ID Card — Dept of Electrical Engineering',
  'Black Leather Bi-Fold Wallet',
  'Set of Dorm Keys with Blue Braided Lanyard',
  'Calculus: Early Transcendentals Textbook (9th Ed)',
];

async function main() {
  console.log('Purging hardcoded demo items from database...');

  for (const title of DEMO_TITLES) {
    const item = await prisma.foundItem.findFirst({
      where: { title },
      include: { verification: true },
    });

    if (item) {
      if (item.verification) {
        await prisma.foundItemVerification.delete({
          where: { id: item.verification.id },
        });
      }
      await prisma.foundItem.delete({
        where: { id: item.id },
      });
      console.log(`Removed demo item: "${title}"`);
    }
  }

  console.log('Cleanup complete. Real user submissions will populate the inventory.');
}

main()
  .catch((e) => {
    console.error('Error clearing demo items:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
