// Test script to verify API fixes
console.log('Testing API endpoints...');

const testCases = [
  // Test normal age range filters
  {
    url: 'http://localhost:3000/api/products?ageRange=6-8',
    description: 'Age range 6-8',
  },
  {
    url: 'http://localhost:3000/api/products?ageRange=9-12',
    description: 'Age range 9-12',
  },
  {
    url: 'http://localhost:3000/api/products?ageRange=13+',
    description: 'Age range 13+',
  },

  // Test filters that should return empty results
  {
    url: 'http://localhost:3000/api/products?minPrice=999999',
    description: 'Very high price filter',
  },
  {
    url: 'http://localhost:3000/api/products?category=NonExistentCategory',
    description: 'Non-existent category',
  },

  // Test combined filters
  {
    url: 'http://localhost:3000/api/products?minPrice=30000&ageRange=9-12',
    description: 'Combined filters',
  },
];

async function testAPI() {
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.description}`);
      console.log(`📡 URL: ${testCase.url}`);

      const response = await fetch(testCase.url);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: Found ${data.products.length} products`);
        console.log(`📊 Total: ${data.pagination.totalProducts} products`);
      } else {
        const errorData = await response.text();
        console.log(`❌ Error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`);
    }
  }
}

// Only run if this script is executed directly (not imported)
if (typeof window === 'undefined') {
  testAPI();
}
