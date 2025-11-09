// Generate fresh set of images with variety
import { generateTimeImage } from './generateTimeImage.js';

const times = [
  '06:00',  // Exact hour (morning) - should show big rectangles
  '09:43',  // Morning with minutes
  '12:00',  // Exact noon - should show big rectangles  
  '14:30',  // Afternoon
  '18:00',  // Exact evening hour - should show big rectangles
  '23:59',  // Late night
];

console.log('🎨 Generating fresh images...\n');

for (const time of times) {
  console.log(`⏰ ${time}...`);
  try {
    const path = await generateTimeImage(time);
    console.log(`   ✅ Generated\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

console.log('🎉 All done! Check generated_images/ folder.');

