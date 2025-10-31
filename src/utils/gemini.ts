import { GoogleGenerativeAI } from "google-generative-ai";

export interface Config {
  apiKey: string;
}

export class GeminiLLM {
  private apiKey: string;

  constructor(config: Config) {
    this.apiKey = config.apiKey;
  }

  async executeLLM(
    prompt: string,
    options?: {
      timeoutMs?: number;
      maxRetries?: number;
      initialBackoffMs?: number;
    },
  ): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? 15000;
    const maxRetries = options?.maxRetries ?? 3;
    const initialBackoffMs = options?.initialBackoffMs ?? 1000;

    let attempt = 0;
    let lastError: unknown = null;
    while (attempt <= maxRetries) {
      try {
        const result = await Promise.race([
          this._callGemini(prompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("LLM request timed out")),
              timeoutMs,
            )
          ),
        ]);
        return result as string;
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt > maxRetries) {
          throw new Error(
            `Gemini API failed after ${attempt} attempts: ${
              (error as Error).message
            }`,
          );
        } else {
          const backoff = initialBackoffMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, backoff));
        }
      }
    }
    throw lastError as Error;
  }

  private async _callGemini(prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { maxOutputTokens: 1000 },
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  }
}
