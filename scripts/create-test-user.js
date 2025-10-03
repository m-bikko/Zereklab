const { getDatabase } = require('../lib/mongodb');
const SalesStaff = require('../models/SalesStaff').default;
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    await getDatabase();
    
    const hashedPassword = bcrypt.hashSync('test123', 10);
    
    const testUser = new SalesStaff({
      username: 'test',
      password: hashedPassword,
      fullName: 'Test User',
      isActive: true
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    console.log('Username: test');
    console.log('Password: test123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();