import OpenAI from "openai";

export const DIRECTR_MODEL = process.env.OPENAI_MODEL || "gpt-4.1";

export function hasCreativeModel(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function responseText(response: unknown): string {
  const result = response && typeof response === "object"
    ? response as Record<string, unknown>
    : {};

  if (typeof result.output_text === "string" && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const output = Array.isArray(result.output) ? result.output : [];
  const pieces: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const piece = part as Record<string, unknown>;
      if (piece.type === "output_text" && typeof piece.text === "string") {
        pieces.push(piece.text);
      }
    }
  }

  return pieces.join("\n").trim();
}

export async function generateStructuredOutput<T>(options: {
  name: string;
  schema: Record<string, unknown>;
  system: string;
  input: string;
  maxOutputTokens?: number;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI is not configured for Directr.");

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: DIRECTR_MODEL,
    max_output_tokens: options.maxOutputTokens || 1800,
    input: [
      { role: "system", content: options.system },
      { role: "user", content: options.input },
    ],
    text: {
      format: {
        type: "json_schema",
        name: options.name,
        strict: true,
        schema: options.schema,
      },
    },
  } as Parameters<typeof client.responses.create>[0]);

  const text = responseText(response);
  if (!text) throw new Error("Directr did not return a creative direction.");

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Directr returned an invalid structured response. Try again.");
  }
}
