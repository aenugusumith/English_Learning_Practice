import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateSpeakingPrompt = async (): Promise<string> => {
  const prompt = `
Generate a unique, creative, and realistic English speaking practice topic for today.
Make it relevant to everyday life or personal experience.

Format:
"🎙️ Today's Prompt: Talk about..."

Keep it short and friendly.
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  return res.choices[0].message?.content?.trim() || 'Talk about something interesting today!';
};
