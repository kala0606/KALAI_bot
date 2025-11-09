import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a static image from the time-based sketch
 * @param {string} birthTime - Time in HH:MM format (e.g., "14:30" or "09:15")
 * @returns {Promise<string>} - Path to the generated PNG file
 */
export async function generateTimeImage(birthTime) {
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(birthTime)) {
    throw new Error('Invalid time format. Please use HH:MM format (e.g., 14:30)');
  }

  const outputDir = path.join(__dirname, 'generated_images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedTime = birthTime.replace(':', '-');
  const outputPath = path.join(outputDir, `time_${sanitizedTime}_${timestamp}.png`);

  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport to match canvas size
    await page.setViewport({
      width: 1000,
      height: 1000,
      deviceScaleFactor: 2 // Higher quality
    });

    // Load the static sketch HTML with time parameter
    const htmlPath = `file://${path.join(__dirname, 'static_sketch.html')}?time=${encodeURIComponent(birthTime)}`;
    await page.goto(htmlPath, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for p5.js to load and render
    await page.waitForFunction(() => {
      return window.renderComplete === true && 
             document.querySelector('canvas') !== null;
    }, { timeout: 15000 });

    // Give a bit more time for final paint
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the canvas element and screenshot it directly
    const canvas = await page.$('canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    await canvas.screenshot({
      path: outputPath,
      type: 'png'
    });

    console.log(`✨ Generated time image for ${birthTime} at: ${outputPath}`);
    return outputPath;

  } catch (error) {
    console.error('Error generating time image:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Cleans up old generated images (older than 1 hour)
 */
export function cleanupOldImages() {
  const outputDir = path.join(__dirname, 'generated_images');
  if (!fs.existsSync(outputDir)) return;

  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const files = fs.readdirSync(outputDir);

  files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtimeMs < oneHourAgo) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Cleaned up old image: ${file}`);
    }
  });
}

