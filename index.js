import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";
import fs from "fs";

const systemPrompt = fs.readFileSync("./kalai_system_prompt.txt", "utf-8");
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const userMemory = new Map();

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