const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zereklab'

const sampleProducts = [
  {
    name: 'Arduino Starter Kit',
    description: 'Complete Arduino kit for beginners with LED, sensors, and breadboard. Perfect for learning electronics and programming basics.',
    price: 25000, // KZT
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=500'
    ],
    category: 'Electronics',
    subcategory: 'Microcontrollers',
    inStock: true,
    features: [
      'Arduino Uno R3 board',
      'Breadboard and jumper wires',
      'LED lights and resistors',
      'Temperature sensor',
      'Step-by-step guide'
    ],
    specifications: {
      'Operating Voltage': '5V',
      'Digital I/O Pins': '14',
      'Analog Input Pins': '6',
      'Memory': '32KB Flash'
    },
    tags: ['arduino', 'electronics', 'programming', 'beginner'],
    ageRange: '12+ years',
    difficulty: 'Beginner',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Robot Building Kit',
    description: 'Build your own programmable robot with motors, sensors, and Bluetooth connectivity. Learn robotics and coding!',
    price: 45000, // KZT
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500',
      'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=500'
    ],
    category: 'Robotics',
    subcategory: 'Mobile Robots',
    inStock: true,
    features: [
      'Programmable microcontroller',
      'DC motors and wheels',
      'Ultrasonic distance sensor',
      'Bluetooth module',
      'Mobile app control'
    ],
    specifications: {
      'Control Method': 'Bluetooth/Autonomous',
      'Battery Life': '4-6 hours',
      'Max Speed': '0.5 m/s',
      'Sensors': 'Ultrasonic, Gyroscope'
    },
    tags: ['robot', 'bluetooth', 'programming', 'motors'],
    ageRange: '14+ years',
    difficulty: 'Intermediate',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Chemistry Lab Kit',
    description: 'Safe chemistry experiments for kids. Includes test tubes, chemicals, and detailed experiment guide.',
    price: 18000, // KZT
    images: [
      'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=500',
      'https://images.unsplash.com/photo-1606185540834-d6e4d3a2b419?w=500'
    ],
    category: 'Science',
    subcategory: 'Chemistry',
    inStock: true,
    features: [
      'Safe, non-toxic chemicals',
      'Test tubes and beakers',
      'pH indicator strips',
      'Measuring tools',
      '20 guided experiments'
    ],
    specifications: {
      'Safety Level': 'Child-safe materials',
      'Experiments': '20+',
      'Age Recommendation': '10+',
      'Supervision': 'Adult recommended'
    },
    tags: ['chemistry', 'science', 'experiments', 'lab'],
    ageRange: '10+ years',
    difficulty: 'Beginner',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Scratch Programming Game Kit',
    description: 'Learn programming with fun games and interactive projects using Scratch visual programming language.',
    price: 12000, // KZT
    images: [
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500'
    ],
    category: 'Programming',
    subcategory: 'Beginner Kits',
    inStock: true,
    features: [
      'Scratch programming course',
      'Interactive game projects',
      'Character sprites',
      'Sound effects library',
      'Online community access'
    ],
    specifications: {
      'Platform': 'Web-based',
      'Programming Language': 'Scratch',
      'Projects': '15+ games',
      'Difficulty': 'No prior experience needed'
    },
    tags: ['scratch', 'programming', 'games', 'visual'],
    ageRange: '8+ years',
    difficulty: 'Beginner',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '3D Design and Printing Kit',
    description: 'Create and print your own 3D models. Includes design software, filament, and detailed tutorials.',
    price: 65000, // KZT
    images: [
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500',
      'https://images.unsplash.com/photo-1562408590-e32931084e23?w=500'
    ],
    category: 'Art & Craft',
    subcategory: '3D Design',
    inStock: false,
    features: [
      'User-friendly 3D design software',
      'PLA filament (multiple colors)',
      'Step-by-step tutorials',
      'Ready-to-print models',
      'Online design community'
    ],
    specifications: {
      'Software': 'TinkerCAD compatible',
      'File Formats': 'STL, OBJ',
      'Filament': 'PLA, 1.75mm',
      'Colors': '5 different colors'
    },
    tags: ['3d-printing', 'design', 'creativity', 'engineering'],
    ageRange: '12+ years',
    difficulty: 'Intermediate',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Solar Energy Kit',
    description: 'Learn about renewable energy by building solar-powered projects. Great for understanding clean energy concepts.',
    price: 32000, // KZT
    images: [
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500'
    ],
    category: 'Engineering',
    subcategory: 'Electrical',
    inStock: true,
    features: [
      'Solar panels and battery',
      'LED lights and motors',
      'Voltage measurement tools',
      'Project instruction book',
      'Environmental impact guide'
    ],
    specifications: {
      'Solar Panel': '6V, 1W',
      'Battery': 'Rechargeable NiMH',
      'Projects': '8 different builds',
      'Learning Topics': 'Solar energy, circuits'
    },
    tags: ['solar', 'renewable', 'energy', 'green'],
    ageRange: '11+ years',
    difficulty: 'Intermediate',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function seedData() {
  let client
  
  try {
    console.log('Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('zereklab')
    const collection = db.collection('products')
    
    // Clear existing products
    console.log('Clearing existing products...')
    await collection.deleteMany({})
    
    // Insert sample products
    console.log('Inserting sample products...')
    const result = await collection.insertMany(sampleProducts)
    
    console.log(`✅ Successfully inserted ${result.insertedCount} products`)
    console.log('Sample products:')
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ₸${product.price.toLocaleString()}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('✅ Database connection closed')
    }
  }
}

// Run the seed function
seedData() 