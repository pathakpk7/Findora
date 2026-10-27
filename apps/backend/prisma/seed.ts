import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Findora administrative accounts...');

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

  // 2. Verified Student account
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

  console.log('Initial accounts ready:', { admin: admin.email, student: student.email });
  console.log('No demo or hardcoded items seeded. Database inventory starts clean.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
