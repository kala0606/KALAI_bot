// Quick test - just generate one image
import { generateTimeImage } from './generateTimeImage.js';

console.log('🧪 Testing image generation for 14:30...');

generateTimeImage('14:30')
  .then(imagePath => {
    console.log('✅ Success! Image saved to:', imagePath);
    console.log('📂 Open the generated_images/ folder to see it!');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });

