// Test specific times to verify the visuals
import { generateTimeImage } from './generateTimeImage.js';

const times = ['09:30', '14:45', '23:15'];

console.log('🎨 Generating test images...\n');

for (const time of times) {
  console.log(`⏰ Generating ${time}...`);
  const path = await generateTimeImage(time);
  console.log(`   ✅ Saved to: ${path}\n`);
}

console.log('🎉 Done! Open generated_images/ to see the results.');

