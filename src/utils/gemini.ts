import { GoogleGenerativeAI } from "google-generative-ai";

export interface Config {
  apiKey: string;
  primaryModel?: string;
  fallbackModels?: string[];
}

export class GeminiLLM {
  private apiKey: string;
  private modelOrder: string[];

  constructor(config: Config) {
    this.apiKey = config.apiKey;
    const primary = config.primaryModel ?? "gemini-2.5-flash-lite";
    const fallbacks = config.fallbackModels ?? [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];
    // De-duplicate while preserving order
    const seen = new Set<string>();
    this.modelOrder = [primary, ...fallbacks].filter((m) => {
      if (seen.has(m)) return false;
      seen.add(m);
      return true;
    });
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
    const maxRetries = options?.maxRetries ?? 5;
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
    let lastErr: unknown = null;
    for (let i = 0; i < this.modelOrder.length; i++) {
      const modelName = this.modelOrder[i];
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { maxOutputTokens: 1000 },
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (typeof text === "string" && text.trim().length > 0) {
          return text;
        }
        // Treat empty text as failure and try next model
        lastErr = new Error(`Empty response from ${modelName}`);
      } catch (e) {
        lastErr = e;
        // Try next model in order
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error("All Gemini model attempts failed");
  }
}
