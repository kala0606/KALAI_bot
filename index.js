import "dotenv/config";

import { Client, GatewayIntentBits, AttachmentBuilder } from "discord.js";
import OpenAI from "openai";
import fs from "fs";
import { generateTimeImage, cleanupOldImages } from "./generateTimeImage.js";

const systemPrompt = fs.readFileSync("./kalai_system_prompt.txt", "utf-8");
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const userMemory = new Map();

// Cleanup old images every hour
setInterval(cleanupOldImages, 60 * 60 * 1000);

client.once("ready", () => {
  console.log(`✨ KALAI is now online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Allow KALAI to speak freely in #kala-ai channel without mentions
  const isKalaiChannel = message.channel.name === "kala-ai";
  const isMentioned = message.mentions.has(client.user);

  // Ignore messages that aren't in #kala-ai and don't mention the bot
  if (!isKalaiChannel && !isMentioned) return;

  const userId = message.author.id;
  const prevMessages = userMemory.get(userId) || [];
  const userMsg = message.content.replace(/<@!?(\d+)>/, "").trim();

  // Detect birth time in HH:MM format (with optional AM/PM)
  const timeRegex = /\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?:\s?(?:AM|PM|am|pm))?\b/;
  const timeMatch = userMsg.match(timeRegex);
  
  // Convert 12-hour to 24-hour format if needed
  let extractedTime = null;
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = userMsg.match(/\b\d{1,2}:\d{2}\s?(AM|PM|am|pm)\b/i);
    
    if (period) {
      const isPM = period[1].toUpperCase() === 'PM';
      const isAM = period[1].toUpperCase() === 'AM';
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }
    }
    
    extractedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Check if message is asking for a birth time visualization
  const isBirthTimeRequest = extractedTime && (
    userMsg.toLowerCase().includes('birth') ||
    userMsg.toLowerCase().includes('born') ||
    userMsg.toLowerCase().includes('ceremony') ||
    userMsg.toLowerCase().includes('timekeeper') ||
    userMsg.toLowerCase().includes('generate') ||
    userMsg.toLowerCase().includes('show') ||
    userMsg.toLowerCase().includes('visualize') ||
    userMsg.toLowerCase().includes('visualise') ||
    userMsg.toLowerCase().includes('my time') ||
    userMsg.toLowerCase().includes('timeline') ||
    userMsg.toLowerCase().includes('time line') ||
    userMsg.toLowerCase().includes('image') ||
    userMsg.toLowerCase().includes('picture') ||
    userMsg.toLowerCase().includes('create') ||
    userMsg.toLowerCase().includes('make') ||
    userMsg.toLowerCase().includes('draw') ||
    userMsg.toLowerCase().includes('render') ||
    userMsg.toLowerCase().includes('display')
  );

  if (isBirthTimeRequest) {
    const birthTime = extractedTime;
    
    try {
      await message.channel.sendTyping();
      
      // Generate the time image
      console.log(`🎨 Generating time image for ${birthTime}...`);
      const imagePath = await generateTimeImage(birthTime);
      
      // Create Discord attachment
      const attachment = new AttachmentBuilder(imagePath, {
        name: `birth_time_${birthTime.replace(':', '-')}.png`
      });
      
      // Send the image with a mystical message
      await message.reply({
        content: `🕰️ **${birthTime}** — Time crystallized into form.\n\nYour birth hour, rendered through the eternal flow of कल.`,
        files: [attachment]
      });
      
      console.log(`✨ Sent time image for ${birthTime} to user ${userId}`);
      
      // Clean up the file after sending
      setTimeout(() => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🧹 Cleaned up image: ${imagePath}`);
        }
      }, 5000);
      
      return; // Don't process through OpenAI
      
    } catch (error) {
      console.error('❌ Error generating time image:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        birthTime: birthTime
      });
      await message.reply("⏳ The temporal threads are tangled... I cannot render your time at this moment. Try again soon.");
      return;
    }
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...prevMessages,
    { role: "user", content: userMsg },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = completion.choices[0].message.content;
    console.log(`User ${userId} used ${completion.usage.total_tokens} tokens`);
    
    // Split long messages to fit Discord's 2000 character limit
    if (reply.length > 2000) {
      const chunks = [];
      let currentChunk = '';
      const lines = reply.split('\n');
      
      for (const line of lines) {
        if (currentChunk.length + line.length + 1 > 2000) {
          chunks.push(currentChunk.trim());
          currentChunk = line;
        } else {
          currentChunk += (currentChunk ? '\n' : '') + line;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // Send first chunk as reply, rest as follow-up messages
      await message.reply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) {
        await message.channel.send(chunks[i]);
      }
    } else {
      await message.reply(reply);
    }

    userMemory.set(userId, [...prevMessages.slice(-5), { role: "user", content: userMsg }, { role: "assistant", content: reply }]);
  } catch (err) {
    console.error("Error:", err);
    
    if (err.code === 'insufficient_quota') {
      await message.reply("🔮 KALAI's cosmic energy has been depleted. The API quota has been exceeded. Please check your OpenAI billing.");
    } else if (err.status === 429) {
      await message.reply("⏳ KALAI is overwhelmed by the cosmic requests. Rate limit exceeded - please wait a moment.");
    } else if (err.code === 50035) {
      await message.reply("📜 KALAI's wisdom flows too deeply for a single message. The cosmic response exceeds Discord's limits.");
    } else {
      await message.reply("KALAI drifts momentarily in the flow of time... try again soon.");
    }
  }
});

client.login(DISCORD_BOT_TOKEN);