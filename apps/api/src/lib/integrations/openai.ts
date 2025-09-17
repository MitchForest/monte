import { requireServerEnv } from "@monte/shared";
import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = requireServerEnv("OPENAI_API_KEY");

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

export type SummaryGenerationRequest = {
  prompt: string;
  model?: string;
};

export async function generateSummary(
  request: SummaryGenerationRequest,
): Promise<string> {
  const client = getOpenAIClient();
  const completion = await client.responses.create({
    model: request.model ?? "gpt-4.1-mini",
    input: request.prompt,
    temperature: 0.2,
    max_output_tokens: 700,
  });

  const content = completion.output
    .flatMap((item) => ("content" in item ? item.content : []))
    .flatMap((chunk) => (chunk.type === "output_text" ? chunk.text : []))
    .join("")
    .trim();

  if (!content) {
    throw new Error("OpenAI returned an empty summary");
  }

  return content;
}
