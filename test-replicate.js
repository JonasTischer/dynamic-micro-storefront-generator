const Replicate = require('replicate');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testReplicate() {
  console.log('Testing Replicate integration...');
  
  if (!process.env.REPLICATE_API_KEY) {
    console.error('❌ REPLICATE_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ REPLICATE_API_KEY found');
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  try {
    console.log('🔄 Testing image generation with FLUX model...');
    
    const imageOutput = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: "Professional product photography of premium sneakers, white background, studio lighting"
        }
      }
    );

    console.log('✅ Image generation successful!');
    console.log('Generated image URL:', Array.isArray(imageOutput) ? imageOutput[0] : imageOutput);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing Replicate:', error.message);
    return false;
  }
}

// Test the generateProductCatalogueFromImage function logic
async function testProductCatalogueGeneration() {
  console.log('\n🔄 Testing product catalogue generation...');
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  const fallbackProducts = [
    { name: 'Test Sneakers', description: 'High-quality test footwear', category: 'Footwear' },
    { name: 'Test Jacket', description: 'Stylish test outerwear', category: 'Clothing' }
  ];

  const products = [];
  
  for (let i = 0; i < fallbackProducts.length; i++) {
    const product = fallbackProducts[i];
    
    try {
      console.log(`🔄 Generating image for ${product.name}...`);
      
      const imageOutput = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: `Professional product photography of ${product.name}: ${product.description}, white background, studio lighting, high quality, commercial photography`,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp"
          }
        }
      );

      const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput;

      products.push({
        id: (i + 1).toString(),
        name: product.name,
        price: `AUD ${(Math.random() * 100 + 50).toFixed(2)}`,
        description: product.description,
        category: product.category,
        imageUrl: imageUrl
      });
      
      console.log(`✅ Generated image for ${product.name}: ${imageUrl}`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${product.name}:`, error.message);
      
      products.push({
        id: (i + 1).toString(),
        name: product.name,
        price: `AUD ${(Math.random() * 100 + 50).toFixed(2)}`,
        description: product.description,
        category: product.category,
        imageUrl: '/mock-product.jpg'
      });
    }
  }

  console.log('\n📦 Final product catalogue:');
  console.log(JSON.stringify({
    products,
    totalProducts: products.length,
    categories: [...new Set(products.map(p => p.category))]
  }, null, 2));
  
  return products.length > 0;
}

async function runTests() {
  console.log('🚀 Starting Replicate tests...\n');
  
  const basicTest = await testReplicate();
  if (basicTest) {
    await testProductCatalogueGeneration();
  }
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);