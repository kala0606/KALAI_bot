// Test custom times
import { generateTimeImage } from './generateTimeImage.js';

const times = ['06:43', '20:53', '12:00'];

console.log('🎨 Generating custom test images...\n');

for (const time of times) {
  console.log(`⏰ Generating ${time}...`);
  const path = await generateTimeImage(time);
  console.log(`   ✅ Saved to: ${path}\n`);
}

console.log('🎉 Done! Check generated_images/ folder.');

