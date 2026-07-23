import { Product } from "./product";

export type AiRoomType =
  | "living room"
  | "bedroom"
  | "kitchen"
  | "study"
  | "bathroom";

export type AiStyle = "minimal" | "warm" | "modern" | "classic" | "natural";

export interface AiRecommendInput {
  roomType?: AiRoomType;
  style?: AiStyle;
  notes?: string;
}

/** Trimmed product shape sent to the model as candidates */
export interface AiCandidateProduct {
  _id: string;
  productName: string;
  productDesc?: string;
  productCollection: string;
  productSize?: string;
  productPrice: number;
}

/** Raw item as returned by the model before hydration */
export interface AiModelRecommendation {
  productId: string;
  reason: string;
}

/** Raw object the model is asked to return */
export interface AiModelResponse {
  recommendations: AiModelRecommendation[];
  summary: string;
}

/** Item returned to the client, hydrated with the full product */
export interface AiRecommendation {
  product: Product;
  reason: string;
}

/** Final response shape */
export interface AiRecommendResult {
  summary: string;
  recommendations: AiRecommendation[];
  message?: string;
}

/**
 * Failure kinds the AI service can raise. The controller maps each to an HTTP
 * status (502 / 503 / 500) — the existing HttpCode/Message enums are not
 * modified, so this stays self-contained.
 */
export type AiErrorKind =
  | "CONFIG"
  | "NETWORK"
  | "QUOTA"
  | "MODEL"
  | "PARSE"
  | "UPSTREAM";

export class AiError extends Error {
  public readonly kind: AiErrorKind;

  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = "AiError";
  }
}
