/**
 * TEST USER CREATION: Script to create a test user for testing existing user login flow
 * Run this script to add a test user to the database
 * Usage: node test-user.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('./models/user');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test user data - use a phone number you can test with
    const testUserData = {
      phone: '+919876543210', // Change this to your test phone number
      email: 'testuser@casa.com',
      display_name: 'Test User',
      interests: ['Streetwear', 'Minimalist', 'Y2K'],
      ml_preferences: ['Oversized', 'Fitted'],
      age: 25,
      last_login: new Date()
    };

    // Check if user already exists
    const existingUser = await User.findOne({ phone: testUserData.phone });
    if (existingUser) {
      console.log('⚠️  Test user already exists:', existingUser.display_name);
      return;
    }

    // Create the test user
    const testUser = new User(testUserData);
    const savedUser = await testUser.save();
    
    console.log('✅ Test user created successfully:');
    console.log('   Phone:', savedUser.phone);
    console.log('   Name:', savedUser.display_name);
    console.log('   Email:', savedUser.email);
    console.log('   Interests:', savedUser.interests);
    console.log('   Preferences:', savedUser.ml_preferences);
    
    console.log('\n🧪 To test existing user flow:');
    console.log('   1. Use phone number:', testUserData.phone);
    console.log('   2. Complete OTP verification');
    console.log('   3. Should skip onboarding and go directly to home page');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

// Run the script
createTestUser();
