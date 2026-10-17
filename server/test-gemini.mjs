import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key present:", !!apiKey, apiKey?.substring(0, 10));

const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}...`);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: 'Respond with exactly: {"status":"ok"}' }] }],
    });
    console.log(`Model ${modelName} SUCCESS:`, response.text);
    return true;
  } catch (err) {
    console.error(`Model ${modelName} FAILED:`, err.message);
    return false;
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-1.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-3.6-flash');
}

run();
