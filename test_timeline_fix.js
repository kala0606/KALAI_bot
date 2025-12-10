// Test script to verify timeline image generation is working properly
import { generateTimeImage } from './generateTimeImage.js';
import fs from 'fs';

async function testImageGeneration() {
  console.log('🧪 Testing KALAI Timeline Image Generation Fix\n');
  console.log('=' .repeat(60));
  
  const testTimes = [
    '14:30',  // Afternoon time
    '07:10',  // Morning time (converted from 7:10AM)
    '02:30',  // Night time (converted from 2:30AM)
    '12:00',  // Noon
    '00:00',  // Midnight
    '23:59'   // End of day
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const time of testTimes) {
    try {
      console.log(`\n⏰ Testing time: ${time}`);
      console.log('   Generating...');
      
      const imagePath = await generateTimeImage(time);
      
      // Check if file exists and has content
      if (fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        if (stats.size > 0) {
          console.log(`   ✅ SUCCESS! Image generated at: ${imagePath}`);
          console.log(`   📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
          successCount++;
        } else {
          console.log(`   ❌ FAILED! File is empty: ${imagePath}`);
          failCount++;
        }
      } else {
        console.log(`   ❌ FAILED! File not found: ${imagePath}`);
        failCount++;
      }
      
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results:');
  console.log(`   ✅ Successful: ${successCount}/${testTimes.length}`);
  console.log(`   ❌ Failed: ${failCount}/${testTimes.length}`);
  console.log('=' .repeat(60));
  
  if (successCount === testTimes.length) {
    console.log('\n🎉 ALL TESTS PASSED! Timeline generation is working properly.');
    console.log('💡 The bot should now generate images consistently.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
    console.log('💡 Make sure Puppeteer and its dependencies are installed correctly.');
  }
  
  console.log('\n📂 Check the generated_images/ folder to view the results.\n');
}

testImageGeneration().catch(error => {
  console.error('\n💥 Test script crashed:', error);
  process.exit(1);
});

