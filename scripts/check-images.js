const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
  process.exit(1);
}

const SocialProjectSchema = new mongoose.Schema({
  title: {
    ru: { type: String },
    kk: { type: String },
    en: { type: String },
  },
  slug: String,
  beforeImage: String,
  afterImage: String,
});

const SocialProject =
  mongoose.models.SocialProject ||
  mongoose.model('SocialProject', SocialProjectSchema);

async function checkImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const projects = await SocialProject.find({});
    console.log(`Found ${projects.length} projects.`);

    projects.forEach(p => {
      console.log(`\nProject: ${p.title?.ru || p.slug}`);
      console.log(`Slug: ${p.slug}`);
      console.log(`Before: ${p.beforeImage}`);
      console.log(`After:  ${p.afterImage}`);

      if (p.beforeImage === p.afterImage) {
        console.log('⚠️  WARNING: Before and After images are IDENTICAL!');
      } else {
        console.log('✅ Images are different.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkImages();
