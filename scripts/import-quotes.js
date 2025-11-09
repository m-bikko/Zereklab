const fs = require('fs');
const path = require('path');

// Simple function to read env files
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const env = {};
  
  for (const file of envFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex === -1) continue;
        
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        
        // Remove surrounding quotes if present
        const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
        env[key] = cleanValue;
      }
    } catch (err) {
      // File doesn't exist, continue
    }
  }
  
  // Set environment variables
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const mongoose = require('mongoose');

// Quote model
const QuoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Quote text is required'],
      trim: true,
      minlength: [10, 'Quote text must be at least 10 characters long'],
      maxlength: [1000, 'Quote text must be less than 1000 characters'], // Увеличен лимит для длинных цитат
    },
    author: {
      type: String,
      required: [true, 'Quote author is required'],
      trim: true,
      maxlength: [200, 'Author name must be less than 200 characters'], // Увеличен лимит для длинных имен и описаний
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'quotes',
  }
);

QuoteSchema.index({ isActive: 1 });
QuoteSchema.index({ createdAt: -1 });

const Quote = mongoose.model('Quote', QuoteSchema);

// Function to load quotes from JSON file
function loadQuotes(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const quotes = JSON.parse(content);
  
  // Add isActive property to all quotes
  return quotes.map(quote => ({
    ...quote,
    isActive: true
  }));
}

async function importQuotes() {
  try {
    console.log('📚 Starting quotes import...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://beimbetm04:qweasdqwe123@zereklab.wqblhwz.mongodb.net/zereklab?retryWrites=true&w=majority&appName=zereklab';
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri, {
      dbName: 'zereklab'  // Explicitly specify database name
    });
    console.log('✅ Connected to MongoDB');
    
    // Clear existing quotes
    const deletedCount = await Quote.deleteMany({});
    console.log(`🗑️  Removed ${deletedCount.deletedCount} existing quotes`);
    
    // Load quotes from JSON file
    const quotesFilePath = path.join(__dirname, '..', 'quotes.json');
    const quotes = loadQuotes(quotesFilePath);
    
    console.log(`📖 Loaded ${quotes.length} quotes from JSON file`);
    
    // Show first few quotes for verification
    if (quotes.length > 0) {
      console.log('\n📝 First 3 quotes:');
      for (let i = 0; i < Math.min(3, quotes.length); i++) {
        console.log(`${i + 1}. "${quotes[i].text}" - ${quotes[i].author}`);
      }
      console.log('');
    }
    
    // Import quotes to database
    if (quotes.length > 0) {
      const insertedQuotes = await Quote.insertMany(quotes);
      console.log(`✅ Successfully imported ${insertedQuotes.length} quotes to database`);
      
      // Verify import
      const totalQuotes = await Quote.countDocuments();
      console.log(`📊 Total quotes in database: ${totalQuotes}`);
    } else {
      console.log('❌ No quotes were parsed from the file');
    }
    
  } catch (error) {
    console.error('❌ Error importing quotes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('✨ Import process completed!');
    process.exit(0);
  }
}

// Run the import
if (require.main === module) {
  importQuotes();
}

module.exports = { importQuotes, loadQuotes };