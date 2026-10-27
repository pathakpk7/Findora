import { PrismaClient, ItemCategory, ItemStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Findora campus data...');

  const hashedAdminPassword = await bcrypt.hash('Admin@123456', 10);
  const hashedStudentPassword = await bcrypt.hash('Student@123456', 10);

  // 1. Admin / Moderator user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@findora.edu' },
    update: {},
    create: {
      email: 'admin@findora.edu',
      username: 'CampusSecurity',
      password: hashedAdminPassword,
      firstName: 'Campus',
      lastName: 'Moderator',
      role: Role.ADMIN,
      department: 'Campus Security & Lost Dept',
      isVerified: true,
      trustScore: 100,
    },
  });

  // 2. Demo student user
  const student = await prisma.user.upsert({
    where: { email: 'student@findora.edu' },
    update: {},
    create: {
      email: 'student@findora.edu',
      username: 'AlexRivers',
      password: hashedStudentPassword,
      firstName: 'Alex',
      lastName: 'Rivers',
      role: Role.USER,
      rollNo: 'CS-2026-088',
      department: 'Computer Science',
      year: 3,
      isVerified: true,
      trustScore: 85,
    },
  });

  console.log('Created users:', { admin: admin.email, student: student.email });

  // 3. Approved Found Items for public campus browsing
  const demoItems = [
    {
      title: 'Apple AirPods Pro (2nd Gen) in White Case',
      category: ItemCategory.EARBUDS,
      publicDescription: 'Found near quiet study desks on the 2nd floor. White charging case with slight scuff mark on bottom.',
      foundLocation: 'Main Campus Library — 2nd Floor Study Hall',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 18),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: student.id,
      verification: {
        create: {
          serialNumber: 'H78X9P0QK',
          privateIdentifyingInfo: 'Engraved with tiny initials inside case lid.',
          privateNotes: 'Stored in campus security locker #12.',
        },
      },
    },
    {
      title: 'Casio Scientific Calculator fx-991EX',
      category: ItemCategory.ELECTRONICS,
      publicDescription: 'Left on bench in physics lab. Black with carbon-fiber patterned lid.',
      foundLocation: 'Science Complex — Physics Lab 304',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 42),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: admin.id,
      verification: {
        create: {
          hiddenMarks: 'Yellow tape on battery cover with handwritten formula.',
        },
      },
    },
    {
      title: 'Student ID Card — Dept of Electrical Engineering',
      category: ItemCategory.ID_CARD,
      publicDescription: 'Student access card found on counter near coffee station.',
      foundLocation: 'Student Union Building — Cafeteria Counter',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: student.id,
      verification: {
        create: {
          privateIdentifyingInfo: 'Student ID number CS/EE-2025-419.',
          privateNotes: 'Kept with front desk receptionist.',
        },
      },
    },
    {
      title: 'Black Leather Bi-Fold Wallet',
      category: ItemCategory.WALLET,
      publicDescription: 'Black textured leather wallet found under bleachers during basketball practice.',
      foundLocation: 'Campus Sports Arena — North Bleachers',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 72),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: admin.id,
      verification: {
        create: {
          hiddenMarks: 'Contains gym membership tag and campus transit card.',
          privateNotes: 'Stored in safe vault room A.',
        },
      },
    },
    {
      title: 'Set of Dorm Keys with Blue Braided Lanyard',
      category: ItemCategory.KEYS,
      publicDescription: '3 metal keys attached to university blue braided lanyard with silver carabiner.',
      foundLocation: 'East Quad Pathway — Near Residence Hall B',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: student.id,
      verification: {
        create: {
          serialNumber: 'Key stamped #408B',
          privateIdentifyingInfo: 'Carabiner has a mini red bottle opener.',
        },
      },
    },
    {
      title: 'Calculus: Early Transcendentals Textbook (9th Ed)',
      category: ItemCategory.BOOK,
      publicDescription: 'Hardcover mathematics textbook found on study table after evening review session.',
      foundLocation: 'Mathematics Building — Room 102',
      foundDate: new Date(Date.now() - 1000 * 60 * 60 * 96),
      status: ItemStatus.APPROVED,
      publicImages: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      ],
      foundById: student.id,
      verification: {
        create: {
          hiddenMarks: 'Highlighted notes on chapters 4 and 5 in green ink.',
        },
      },
    },
  ];

  for (const itemData of demoItems) {
    const existing = await prisma.foundItem.findFirst({
      where: { title: itemData.title },
    });
    if (!existing) {
      await prisma.foundItem.create({
        data: itemData,
      });
    }
  }

  console.log(`Seeded ${demoItems.length} approved campus items successfully.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
