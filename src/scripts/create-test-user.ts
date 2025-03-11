/**
 * Script to create a test user in Neon DB (Postgres) for assessment tracking
 */

import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test user details
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123', // This will be hashed before storing
  role: 'student'
};

async function main() {
  try {
    console.log('Creating test user in Neon DB (Postgres)...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, TEST_USER.email),
    });
    
    if (existingUser) {
      // Update existing user
      console.log('User already exists, updating...');
      await db.update(users)
        .set({
          name: TEST_USER.name,
          role: TEST_USER.role,
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(users.email, TEST_USER.email));
    } else {
      // Create new user
      console.log('Creating new user...');
      await db.insert(users).values({
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: hashedPassword,
        role: TEST_USER.role,
      });
    }
    
    console.log('Test user created or updated successfully');
    
    // Verify user was created
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, TEST_USER.email),
    });
    
    if (userRecord) {
      console.log(`User: ${userRecord.name} (${userRecord.id})`);
      console.log(`Email: ${userRecord.email}, Role: ${userRecord.role}`);
    }
    
    console.log('Done!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

// Execute the script
main(); 