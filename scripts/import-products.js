const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

const MultilingualTextSchema = new mongoose.Schema(
  {
    ru: { type: String, required: true, trim: true },
    kk: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: MultilingualTextSchema, required: true },
    description: { type: MultilingualTextSchema },
    subcategories: { type: [MultilingualTextSchema], default: [] },
    parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'categories' }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: MultilingualTextSchema, required: true },
    description: { type: MultilingualTextSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    videoUrl: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    inStock: { type: Boolean, default: true },
    features: { type: [MultilingualTextSchema], default: [] },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] },
    sku: { type: String, required: true, trim: true, unique: true },
    ageRange: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    relatedProducts: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0, min: 0 },
    estimatedDelivery: { type: String, trim: true },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
    },
    parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'products' }
);

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

const categoryTranslations = {
  'Настольные игры': { kk: 'Үстел ойындары', en: 'Board Games' },
  Конструкторы: { kk: 'Конструкторлар', en: 'Constructors' },
  'Наборы для экспериментов': {
    kk: 'Тәжірибе жинақтары',
    en: 'Experiment Kits',
  },
  Робототехника: { kk: 'Робототехника', en: 'Robotics' },
  Головоломки: { kk: 'Жұмбақтар', en: 'Puzzles' },
  'Развивающие игрушки': { kk: 'Дамытушы ойыншықтар', en: 'Educational Toys' },
};

async function run() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
  console.log('Connected to MongoDB');

  const dataPath = path.resolve(__dirname, '../toImport.json');
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Loaded ${products.length} products from toImport.json`);

  // --- Create categories ---
  const categoryNames = [...new Set(products.map(p => p.category))];
  let createdCats = 0;
  let skippedCats = 0;

  for (const catRu of categoryNames) {
    const existing = await Category.findOne({ 'name.ru': catRu });
    if (existing) {
      skippedCats++;
      continue;
    }

    const tr = categoryTranslations[catRu] || { kk: catRu, en: catRu };
    const subcategoryNames = [
      ...new Set(
        products
          .filter(p => p.category === catRu && p.subcategory)
          .map(p => p.subcategory)
      ),
    ];
    const subcategories = subcategoryNames.map(sub => ({
      ru: sub,
      kk: sub,
      en: sub,
    }));

    await Category.create({
      name: { ru: catRu, kk: tr.kk, en: tr.en },
      description: { ru: catRu, kk: tr.kk, en: tr.en },
      subcategories,
    });
    createdCats++;
  }
  console.log(
    `Categories: ${createdCats} created, ${skippedCats} already existed`
  );

  // --- Insert products ---
  let inserted = 0;
  let skipped = 0;
  const errors = [];

  for (const product of products) {
    const existing = await Product.findOne({ sku: product.sku });
    if (existing) {
      skipped++;
      continue;
    }

    try {
      await Product.create(product);
      inserted++;
    } catch (err) {
      errors.push({ sku: product.sku, error: err.message });
    }
  }

  console.log(`Products: ${inserted} inserted, ${skipped} already existed`);
  if (errors.length > 0) {
    console.error('Errors:');
    errors.forEach(e => console.error(`  SKU ${e.sku}: ${e.error}`));
  }

  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
