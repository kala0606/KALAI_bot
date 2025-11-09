# Birth Time Visualization Feature

## Overview
KALAI can now generate personalized time-based artwork from birth times. When users share their birth time in HH:MM format, the bot generates a unique visualization based on the Order of KALA's time-based sketch.

## How It Works

### User Experience
Users can ask KALAI to visualize their birth time by sending messages like:
- "My birth time is 14:30"
- "I was born at 09:15"
- "Show me 23:45"
- "Generate my time 07:20"
- "Timekeeper ceremony for 16:00"

The bot will automatically:
1. Detect the HH:MM time format
2. Generate a unique black-and-white artwork
3. Send the PNG image back to the user
4. Clean up the file after sending

### Technical Details

**Time Format**: 24-hour format (HH:MM)
- Valid: `14:30`, `09:15`, `00:00`, `23:59`
- Invalid: `25:00`, `14:70`, `2:30` (single digit hour)

**Image Generation**:
- Uses Puppeteer to render the p5.js sketch in a headless browser
- Canvas size: 1000x1000 pixels
- Output: High-quality PNG (2x device pixel ratio)
- Background color changes based on AM/PM (white for PM, black for AM)

**Sketch Components**:
- **Rows**: Number of horizontal rows = hour (in 12-hour format)
- **Boids**: Number of moving elements per row = minutes
- **Style**: Parallel lines with generative variations
- **Color scheme**: Black and white, inverted for AM/PM

## Files Created/Modified

### New Files
1. `static_sketch.html` - Standalone HTML that renders the time sketch
2. `generateTimeImage.js` - Node.js module for image generation with Puppeteer
3. `BIRTH_TIME_FEATURE.md` - This documentation file

### Modified Files
1. `index.js` - Added birth time detection and image sending logic
2. `package.json` - Added Puppeteer dependency
3. `Dockerfile` - Updated to support Puppeteer/Chromium in container

## Installation

### Local Development
```bash
cd KALAI_bot
npm install
node index.js
```

### Docker Deployment
```bash
cd KALAI_bot
docker build -t kalai-bot .
docker run -e DISCORD_BOT_TOKEN=your_token -e OPENAI_API_KEY=your_key kalai-bot
```

### Fly.io Deployment
```bash
fly deploy
```

## Cost Impact on Fly.io

**CPU Usage**: Each image generation takes ~2-5 seconds of CPU time
**Memory**: Headless Chrome requires ~200-500MB RAM
**Bandwidth**: Each PNG is approximately 100-500KB

**Estimated Monthly Costs**:
- Low usage (<100 requests/month): +$1-5
- Medium usage (100-1000 requests/month): +$5-10
- High usage (>1000 requests/month): +$10-20

**Recommendations**:
1. Monitor Fly.io metrics dashboard
2. Set up budget alerts
3. Consider rate limiting if usage spikes
4. Optimize cleanup interval (currently 1 hour)

## Testing

### Manual Testing (Discord)
1. Send a message: "My birth time is 14:30"
2. Wait for the bot to generate and send the image
3. Verify the image matches the time visualization

### Local Testing (Node)
```javascript
import { generateTimeImage } from './generateTimeImage.js';

// Test generation
const imagePath = await generateTimeImage('14:30');
console.log('Image generated at:', imagePath);
```

## Cleanup & Maintenance

**Automatic Cleanup**:
- Images are deleted 5 seconds after being sent to Discord
- Old orphaned images (>1 hour) are cleaned up every hour

**Manual Cleanup**:
```bash
rm -rf generated_images/*
```

## Troubleshooting

### Puppeteer Fails to Launch
- **Docker**: Ensure Chromium dependencies are installed (check Dockerfile)
- **Fly.io**: Use `node:20-slim` base image, not Alpine
- **Local**: Run `npx puppeteer browsers install chrome`

### Images Not Generating
- Check console logs for errors
- Verify `static_sketch.html` is in the correct directory
- Ensure write permissions for `generated_images/` folder

### Discord Send Fails
- Check file size (should be <8MB for standard Discord)
- Verify bot has `ATTACH_FILES` permission
- Check network connectivity

## Future Enhancements

Possible improvements:
- [ ] Add date parameter for full birth date + time
- [ ] Support different art styles/themes
- [ ] Add text overlay with birth time
- [ ] Generate animated GIF instead of static PNG
- [ ] Add metadata/EXIF data to images
- [ ] Implement caching for repeated times
- [ ] Add rate limiting per user

## Keywords for Bot Detection

The bot looks for these keywords + HH:MM time:
- birth
- born
- ceremony
- timekeeper
- generate
- show
- visualize
- my time

Example: "Show me 15:30" or "My birth time is 08:45"

