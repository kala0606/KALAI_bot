// Test the fix with low hour numbers and various times
import { generateTimeImage } from './generateTimeImage.js';

const times = [
  '02:15',  // Low hour - the problematic case
  '01:30',  // Even lower
  '06:00',  // Exact hour for comparison
  '09:43',  // Mid hour
  '12:00',  // Noon exact
];

console.log('🧪 Testing fixed alignment...\n');

for (const time of times) {
  console.log(`⏰ ${time}...`);
  const path = await generateTimeImage(time);
  console.log(`   ✅ Generated\n`);
}

console.log('🎉 Done! Check if 02:15 and 01:30 are properly aligned now.');

