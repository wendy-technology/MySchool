const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/myschool_test'
    }
  }
});

beforeAll(async () => {
  console.log('Setting up test database...');
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  
});

global.prisma = prisma;