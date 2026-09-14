import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';
import { seedAdminAccount } from '../src/lib/seed-admin.js';

const prisma = new PrismaClient();

const seedAccounts = [
  {
    email: 'admin@acs.com',
    password: '#admin123',
    firstName: 'Admin',
    lastName: 'User',
    roleName: 'ADMIN'
  },
  {
    email: 'organizer@example.com',
    password: 'password123',
    firstName: 'Organizer',
    lastName: 'Admin',
    roleName: 'ORGANIZER',
    organizationName: 'Pro Cycling League Spain'
  },
  {
    email: 'cyclist1@example.com',
    password: 'password123',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    roleName: 'CYCLIST',
    bornYear: 1995,
    gender: 'M'
  }
] as const;

async function seedDevelopmentAccounts() {
  if (process.env.NODE_ENV === 'production') {
    console.log('  - Skipped development accounts in production');
    return;
  }

  const organization = await prisma.organization.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    update: { name: 'Pro Cycling League Spain', state: 'ACTIVE' },
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      name: 'Pro Cycling League Spain',
      description: 'Development organization for seeded accounts'
    }
  });

  for (const account of seedAccounts) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: account.roleName } });
    const password = await hashPassword(account.password);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: `${account.firstName} ${account.lastName}`,
        firstName: account.firstName,
        lastName: account.lastName,
        emailVerified: true,
        status: 'ACTIVE',
        roleId: role.id
      },
      create: {
        email: account.email,
        name: `${account.firstName} ${account.lastName}`,
        firstName: account.firstName,
        lastName: account.lastName,
        emailVerified: true,
        status: 'ACTIVE',
        roleId: role.id
      }
    });

    await prisma.account.upsert({
      where: { issuer_accountId: { issuer: 'local:credential', accountId: user.id } },
      update: { password },
      create: {
        id: randomUUID(),
        userId: user.id,
        issuer: 'local:credential',
        accountId: user.id,
        providerId: 'credential',
        password
      }
    });

    if (account.roleName === 'ORGANIZER') {
      await prisma.cyclist.deleteMany({ where: { userId: user.id } });
      await prisma.organizer.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
        update: {},
        create: { userId: user.id, organizationId: organization.id }
      });
    } else if (account.roleName === 'CYCLIST') {
      const gender = await prisma.cyclistGender.findUniqueOrThrow({ where: { name: account.gender } });
      await prisma.organizer.deleteMany({ where: { userId: user.id } });
      await prisma.cyclist.upsert({
        where: { userId: user.id },
        update: { bornYear: account.bornYear, genderId: gender.id },
        create: { userId: user.id, bornYear: account.bornYear, genderId: gender.id }
      });
    } else {
      await prisma.organizer.deleteMany({ where: { userId: user.id } });
      await prisma.cyclist.deleteMany({ where: { userId: user.id } });
    }
  }

  console.log(`  ✓ ${seedAccounts.length} development accounts`);
}

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = ['PUBLIC', 'CYCLIST', 'ORGANIZER', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log(`  ✓ ${roles.length} roles`);

  const adminResult = await seedAdminAccount(prisma);
  if (adminResult === 'created') {
    console.log('  ✓ Production admin account');
  } else if (adminResult === 'already-exists') {
    console.log('  - Admin account already exists');
  } else {
    console.log('  - Skipped optional admin account');
  }

  // Cyclist genders
  const genders = ['M', 'F'];
  for (const name of genders) {
    await prisma.cyclistGender.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log(`  ✓ ${genders.length} cyclist genders`);

  await seedDevelopmentAccounts();

  // Race categories (age groups)
  const categories = [
    'Absoluta',
    'Elite',
    'Sub-23 (19-23)',
    'Juvenil A (13-14)',
    'Juvenil B (15-16)',
    'Junior (17-18)',
    'Master A (31-40)',
    'Master B (41-50)',
    'Master C (51-60)',
    'Master D (61-70)',
    'Master E (71-80)',
    'Rango 18-29',
    'Rango 18-34',
    'Rango 18-39',
    'Rango 30-34',
    'Rango 30-39',
    'Rango 35-39',
    'Rango 40-44',
    'Rango 40-49',
    'Rango 45-49',
    'Rango 50-54',
    'Rango 50-59',
    'Rango 55-59',
    'Rango 60-64',
    'Rango 60-69',
    'Rango 65-69'
  ];
  for (const name of categories) {
    await prisma.raceCategory.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Absoluta' }
    });
  }
  console.log(`  ✓ ${categories.length} race categories`);

  // Race category genders
  const categoryGenders = ['Femenino', 'Masculino', 'Abierto'];
  for (const name of categoryGenders) {
    await prisma.raceCategoryGender.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Abierto' }
    });
  }
  console.log(`  ✓ ${categoryGenders.length} race category genders`);

  // Race category lengths
  const categoryLengths = ['Larga', 'Corta', 'Sprint', 'Única'];
  for (const name of categoryLengths) {
    await prisma.raceCategoryLength.upsert({
      where: { name },
      update: {},
      create: { name, isGlobal: true, isDefault: name === 'Única' }
    });
  }
  console.log(`  ✓ ${categoryLengths.length} race category lengths`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
