import fetch from "node-fetch";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";
import {
  AiCandidateProduct,
  AiError,
  AiModelResponse,
  AiRecommendInput,
} from "../libs/types/ai";

/**
 * Gemini REST endpoint. We use plain fetch (Node 18+) rather than adding a new
 * dependency. The model is a stable GA release, not a preview one.
 */
const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 15_000;
const CANDIDATE_LIMIT = 60;
/** One retry on 429 (quota) only, after this delay. */
const QUOTA_RETRY_DELAY_MS = 2_000;

class AiService {
  private readonly productModel;

  constructor() {
    this.productModel = ProductModel;
  }

  /**
   * Fetch candidate products. Only PROCESS products with stock, capped at 60.
   * We select the fields the prompt needs plus the fields the client needs for
   * hydration (images, price, stock).
   */
  public async getCandidateProducts(): Promise<Product[]> {
    const result = await this.productModel
      .find({
        productStatus: ProductStatus.PROCESS,
        productLeftCount: { $gt: 0 },
      })
      .limit(CANDIDATE_LIMIT)
      .lean()
      .exec();

    return (result as unknown as Product[]) ?? [];
  }

  /** Compact projection of the candidates that is safe to send to the model. */
  private toCandidatePayload(products: Product[]): AiCandidateProduct[] {
    return products.map((p) => ({
      _id: String(p._id),
      productName: p.productName,
      productDesc: p.productDesc,
      productCollection: String(p.productCollection),
      productSize: p.productSize ? String(p.productSize) : undefined,
      productPrice: p.productPrice,
    }));
  }

  private buildPrompt(
    input: AiRecommendInput,
    candidates: AiCandidateProduct[]
  ): string {
    const roomType = input.roomType ?? "unspecified";
    const style = input.style ?? "unspecified";
    const notes = input.notes ?? "none";

    return [
      "You are an interior-decor assistant for an online home-decor store.",
      "You are given a list of CANDIDATE PRODUCTS as a JSON array. You may ONLY",
      "recommend products from this list. Never invent products, names, or IDs.",
      "",
      "CANDIDATE PRODUCTS:",
      JSON.stringify(candidates),
      "",
      "USER REQUEST:",
      `- roomType: ${roomType}`,
      `- style: ${style}`,
      `- notes: ${notes}`,
      "",
      "TASK:",
      "Pick 3 to 4 products that genuinely fit this room and style. If fewer than",
      "3 genuinely fit, pick fewer (even zero) rather than padding with poor matches.",
      "Only use productId values that appear verbatim in the CANDIDATE PRODUCTS list.",
      "",
      "Respond with ONLY a JSON object (no markdown, no code fences, no prose) in",
      "exactly this shape:",
      '{"recommendations":[{"productId":"<_id from the list>","reason":"<one short sentence>"}],"summary":"<one sentence describing the overall look>"}',
    ].join("\n");
  }

  /**
   * Call Gemini and return the parsed, validated model response.
   * Throws AiError("CONFIG") on missing key, AiError("NETWORK") on
   * network/timeout, AiError("PARSE") if the output can't be parsed.
   * Never logs or returns the prompt, raw output, or API key.
   */
  public async recommend(
    input: AiRecommendInput,
    candidates: Product[]
  ): Promise<AiModelResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AiError("CONFIG", "AI service is not configured.");
    }

    const payload = this.toCandidatePayload(candidates);
    const prompt = this.buildPrompt(input, payload);

    const rawText = await this.callGemini(apiKey, prompt);

    const parsed = this.parseModelOutput(rawText);
    if (!parsed) {
      // The upstream call SUCCEEDED (HTTP 2xx) but its body was not valid
      // JSON. This is a parsing/content problem, not an upstream/config one.
      console.error(
        "Ai.service: PARSE FAILURE — Gemini returned 2xx but the response body could not be parsed as JSON."
      );
      throw new AiError("PARSE", "Could not read the AI response.");
    }

    // Validate that every returned productId exists among candidates.
    const validIds = new Set(payload.map((c) => c._id));
    const recommendations = (parsed.recommendations ?? []).filter(
      (r) =>
        r &&
        typeof r.productId === "string" &&
        typeof r.reason === "string" &&
        validIds.has(r.productId)
    );

    return {
      recommendations,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };
  }

  /**
   * Perform the HTTP call with a 15s timeout, returning the raw model text.
   * Retries exactly once on a 429 (quota) after a 2s wait, then gives up.
   * All other failures (network/timeout, other non-2xx) are not retried.
   */
  private async callGemini(apiKey: string, prompt: string): Promise<string> {
    try {
      return await this.callGeminiOnce(apiKey, prompt);
    } catch (err) {
      if (err instanceof AiError && err.kind === "QUOTA") {
        // Single retry on quota only: wait 2s and try once more.
        await new Promise((resolve) =>
          setTimeout(resolve, QUOTA_RETRY_DELAY_MS)
        );
        return await this.callGeminiOnce(apiKey, prompt);
      }
      throw err;
    }
  }

  /** A single Gemini HTTP attempt with a 15s timeout. Returns raw model text. */
  private async callGeminiOnce(apiKey: string, prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        // Never log the response body — it may echo request context.
        if (response.status === 429) {
          console.error("Ai.service: Gemini quota exceeded (429).");
          throw new AiError(
            "QUOTA",
            "Too many requests right now. Please try again in a minute."
          );
        }
        if (response.status === 404) {
          // Config problem, NOT a bad AI response: the model name is wrong
          // or unavailable for this key. Make that obvious in the log.
          console.error(
            `Ai.service: CONFIG ERROR — model "${GEMINI_MODEL}" was NOT FOUND or is UNAVAILABLE for this API key (HTTP 404). Update GEMINI_MODEL.`
          );
          throw new AiError("MODEL", "AI service is misconfigured.");
        }
        console.error(
          "Ai.service: Gemini returned an unexpected error status:",
          response.status
        );
        throw new AiError("UPSTREAM", "AI service returned an error.");
      }

      const data: any = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (err) {
      if (err instanceof AiError) throw err;
      // Abort (timeout) or network failure. Log a short message only.
      console.error("Ai.service: Gemini network/timeout error.");
      throw new AiError("NETWORK", "AI service is unavailable.");
    } finally {
      clearTimeout(timer);
    }
  }

  /** Strip ```json fences and JSON.parse defensively. Returns null on failure. */
  private parseModelOutput(raw: string): AiModelResponse | null {
    if (!raw) return null;

    let text = raw.trim();

    // Remove a leading ```json / ``` fence and trailing ``` fence if present.
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    }

    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object") return obj as AiModelResponse;
      return null;
    } catch {
      return null;
    }
  }
}

export default AiService;
