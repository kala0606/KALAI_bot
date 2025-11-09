/**
 * Test script for birth time image generation
 * Run with: node test_image_gen.js
 */

import { generateTimeImage } from './generateTimeImage.js';
import fs from 'fs';

async function testImageGeneration() {
  console.log('🧪 Testing Birth Time Image Generation...\n');

  const testTimes = [
    '14:30',  // Afternoon
    '09:15',  // Morning
    '00:00',  // Midnight
    '12:00',  // Noon
    '23:59',  // Just before midnight
  ];

  for (const time of testTimes) {
    try {
      console.log(`⏰ Testing time: ${time}`);
      const imagePath = await generateTimeImage(time);
      
      // Check if file exists
      if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        console.log(`✅ Success! Image generated at: ${imagePath}`);
        console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB\n`);
      } else {
        console.log(`❌ Failed! File not found: ${imagePath}\n`);
      }
    } catch (error) {
      console.error(`❌ Error generating image for ${time}:`, error.message, '\n');
    }
  }

  console.log('🎉 Test complete! Check the generated_images/ folder.');
  console.log('💡 Tip: Open the PNG files to verify they look correct.');
}

// Run tests
testImageGeneration().catch(console.error);

