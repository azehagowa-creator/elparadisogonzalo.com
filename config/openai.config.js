import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
