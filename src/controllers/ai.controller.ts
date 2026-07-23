import { Request, Response } from "express";
import { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import AiService from "../models/Ai.service";
import {
  AiError,
  AiRecommendInput,
  AiRecommendResult,
  AiRoomType,
  AiStyle,
} from "../libs/types/ai";
import { Product } from "../libs/types/product";

const aiService = new AiService();

const ROOM_TYPES: AiRoomType[] = [
  "living room",
  "bedroom",
  "kitchen",
  "study",
  "bathroom",
];
const STYLES: AiStyle[] = ["minimal", "warm", "modern", "classic", "natural"];
const NOTES_MAX = 300;

/** Simple in-memory rate limit: max 10 requests per IP per minute. */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const hits = (rateHits.get(ip) ?? []).filter((t) => t > windowStart);

  if (hits.length >= RATE_LIMIT) {
    rateHits.set(ip, hits);
    return true;
  }

  hits.push(now);
  rateHits.set(ip, hits);
  return false;
}

const aiController: T = {};

aiController.recommend = async (req: Request, res: Response) => {
  try {
    console.log("recommend");

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again in a minute." });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;

    // Validate roomType / style against the allowed sets (both optional).
    const input: AiRecommendInput = {};

    if (body.roomType !== undefined) {
      if (!ROOM_TYPES.includes(body.roomType as AiRoomType)) {
        return res.status(HttpCode.BAD_REQUEST).json({
          message: `roomType must be one of: ${ROOM_TYPES.join(", ")}.`,
        });
      }
      input.roomType = body.roomType as AiRoomType;
    }

    if (body.style !== undefined) {
      if (!STYLES.includes(body.style as AiStyle)) {
        return res.status(HttpCode.BAD_REQUEST).json({
          message: `style must be one of: ${STYLES.join(", ")}.`,
        });
      }
      input.style = body.style as AiStyle;
    }

    if (body.notes !== undefined) {
      if (typeof body.notes !== "string") {
        return res
          .status(HttpCode.BAD_REQUEST)
          .json({ message: "notes must be a string." });
      }
      // Truncate to 300 chars server-side before it reaches the prompt.
      const notes = body.notes.trim().slice(0, NOTES_MAX);
      if (notes) input.notes = notes;
    }

    // At least one field must be present.
    if (
      input.roomType === undefined &&
      input.style === undefined &&
      input.notes === undefined
    ) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          "Provide at least one of: roomType, style, or notes describing your room.",
      });
    }

    // Fetch candidates. If none, return 200 with an empty list — skip Gemini.
    const candidates = await aiService.getCandidateProducts();
    if (!candidates.length) {
      const empty: AiRecommendResult = {
        summary: "",
        recommendations: [],
        message: "No products are currently available to recommend.",
      };
      return res.status(HttpCode.OK).json(empty);
    }

    const model = await aiService.recommend(input, candidates);

    // Hydrate: attach the full product document to each valid recommendation.
    const byId = new Map<string, Product>(
      candidates.map((p) => [String(p._id), p])
    );
    const recommendations = model.recommendations
      .map((r) => {
        const product = byId.get(r.productId);
        return product ? { product, reason: r.reason } : null;
      })
      .filter((r): r is { product: Product; reason: string } => r !== null);

    const result: AiRecommendResult = {
      summary: model.summary,
      recommendations,
    };

    return res.status(HttpCode.OK).json(result);
  } catch (err) {
    // Map AI failures to the right status without leaking internals.
    if (err instanceof AiError) {
      if (err.kind === "QUOTA") {
        return res.status(429).json({
          message: "Too many requests right now. Please try again in a minute.",
        });
      }
      if (err.kind === "NETWORK") {
        return res.status(503).json({
          message: "The recommendation service is busy. Please try again.",
        });
      }
      if (
        err.kind === "PARSE" ||
        err.kind === "UPSTREAM" ||
        err.kind === "MODEL"
      ) {
        return res
          .status(502)
          .json({ message: "The AI returned an unexpected response." });
      }
      // CONFIG or anything else — generic 500.
      return res
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong." });
    }

    console.error("Error, recommend");
    return res
      .status(HttpCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong." });
  }
};

export default aiController;
