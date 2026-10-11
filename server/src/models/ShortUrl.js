import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true, trim: true, maxlength: 4096 },
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    clicks: { type: Number, default: 0, min: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

export default mongoose.model("ShortUrl", shortUrlSchema);
