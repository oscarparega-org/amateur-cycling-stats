import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = ['PUBLIC', 'CYCLIST', 'ORGANIZER_STAFF', 'ORGANIZER_OWNER', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log(`  ✓ ${roles.length} roles`);

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
