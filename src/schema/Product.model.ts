// import mongoose, { Schema } from "mongoose";
// import {
//   ProductCollection,
//   ProductSize,
//   ProductStatus,
//   ProductVolume,
//   ProductMaterial,
//   RoomType,
//   ProductColor,
//   ProductStyle,
// } from "../libs/enums/product.enum";

// const productSchema = new Schema(
//   {
//     productStatus: {
//       type: String,
//       enum: ProductStatus,
//       default: ProductStatus.PAUSE,
//     },
//     productCollection: {
//       type: String,
//       enum: ProductCollection,
//       required: true,
//     },
//     productName: { type: String, required: true },
//     productPrice: { type: Number, required: true },
//     productLeftCount: { type: Number, required: true },
//     productSize: {
//       type: String,
//       enum: ProductSize,
//       default: ProductSize.MEDIUM,
//     },
//     productVolume: {
//       type: String,
//       enum: ProductVolume,
//       default: ProductVolume.SINGLE,
//     },
//     productMaterial: {
//       type: String,
//       enum: ProductMaterial,
//       default: ProductMaterial.OTHER,
//     },
//     roomType: { type: String, enum: RoomType, default: RoomType.OTHER },
//     productColor: {
//       type: String,
//       enum: ProductColor,
//       default: ProductColor.OTHER,
//     },
//     productStyle: {
//       type: String,
//       enum: ProductStyle,
//       default: ProductStyle.OTHER,
//     },
//     productDesc: { type: String },
//     productImages: { type: [String], default: [] },
//     productViews: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// productSchema.index(
//   { productName: 1, productSize: 1, productVolume: 1 },
//   { unique: true }
// );

// export default mongoose.model("Product", productSchema);

import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
  ProductVolume,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productLeftCount: { type: Number, required: true },

    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    // faqat bittasi ishlatiladi
    productSize: {
      type: String,
      enum: ProductSize,
      default: null,
    },

    productVolume: {
      type: String,
      enum: ProductVolume,
      default: null,
    },

    productDesc: { type: String },
    productImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

// duplicate oldini oladi
productSchema.index(
  { productName: 1, productSize: 1, productVolume: 1 },
  { unique: true }
);

export default mongoose.model("Product", productSchema);
