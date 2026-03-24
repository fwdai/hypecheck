import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function getResolvedAnthropicModel(): string {
  const model = process.env.ANTHROPIC_MODEL?.trim();
  if (!model) {
    throw new Error("Server misconfiguration: ANTHROPIC_MODEL is not set.");
  }
  return model;
}

const resultSchema = z.object({
  analyzable: z.boolean(),
});

const SYSTEM = `You gate-keep a tech hype analysis product. The user typed a search query that did NOT match any known term in our database.

Decide if the query names (or clearly enough points to) ONE specific technology people could analyze: a product, framework, library, programming language, company, AI model, chip, standard, or a well-known research line with a name.

Respond with a single JSON object only. No markdown. No prose. Shape: {"analyzable":true} or {"analyzable":false}

Use analyzable:false when:
- Obvious nonsense, random words, or likely typos that do not name real tech (e.g. celebrity names + nonsense).
- Only vague wishlists, mashups, or generic descriptions with no identifiable named thing (e.g. "a gravity powered well powered by ai", "C++ web framework with nodejs syntax" as a description without a product name).
- The query cannot be tied to one coherent real-world tech subject.

Use analyzable:true when:
- It names or clearly identifies a real or plausible product/project/framework/model, even if niche or new.`;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  return new Anthropic({ apiKey });
}

function parseJsonObjectFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const body = fenced ? fenced[1].trim() : trimmed;
  const first = body.indexOf("{");
  const last = body.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Response did not contain a JSON object.");
  }
  return JSON.parse(body.slice(first, last + 1));
}

function extractAssistantText(
  content: Anthropic.Messages.Message["content"],
): string {
  const parts: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      parts.push(block.text);
    }
  }
  return parts.join("");
}

/**
 * True when the query looks like a specific analyzable tech subject.
 * If Anthropic is not configured, returns true (skip gate; legacy behavior).
 * On model/parse errors, returns true so we do not block legitimate users.
 */
export async function isQueryAnalyzable(query: string): Promise<boolean> {
  if (!isAnthropicConfigured()) return true;

  const trimmed = query.trim();
  if (!trimmed) return false;

  const model = getResolvedAnthropicModel();
  const client = getClient();

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 120,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Classify this search query:\n${JSON.stringify(trimmed)}`,
        },
      ],
    });

    const text = extractAssistantText(response.content);
    if (!text.trim()) return true;

    const raw = parseJsonObjectFromModelText(text);
    const parsed = resultSchema.safeParse(raw);
    if (!parsed.success) return true;
    return parsed.data.analyzable;
  } catch (e) {
    console.error("[isQueryAnalyzable]", e);
    return true;
  }
}
