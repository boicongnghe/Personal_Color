require('dotenv').config({ path: require('path').join(__dirname, 'src', '..', '.env') });
// fallback: try loading .env from server/ folder
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
}

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./src/models/User');

const ADMIN_EMAIL    = 'admin@clarity.app';
const ADMIN_PASSWORD = 'admin';
const ADMIN_NAME     = 'Admin';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Create server/.env with MONGODB_URI=...');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Update to admin if already exists
    existing.isAdmin     = true;
    existing.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await existing.save();
    console.log('Admin account updated:', ADMIN_EMAIL);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      email:       ADMIN_EMAIL,
      passwordHash,
      displayName: ADMIN_NAME,
      isAdmin:     true,
      subscriptionTier: 'premium',
    });
    console.log('Admin account created:', ADMIN_EMAIL);
  }

  console.log('---');
  console.log('Email   :', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);
  console.log('Role    : admin + premium');
  console.log('---');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
