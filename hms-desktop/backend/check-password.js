// Check password for mohit user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    console.log('🔍 Checking password for mohit user...\n');

    const user = await prisma.user.findUnique({
      where: { username: 'mohit' },
      select: {
        id: true,
        username: true,
        fullName: true,
        passwordHash: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('User found:', {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive
    });

    // Test common passwords
    const passwords = ['admin123', 'admin', 'password', 'mohit123', '123456'];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`Password "${password}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();

