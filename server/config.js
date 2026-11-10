import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  sessionSecret: process.env.SESSION_SECRET || "secreto_super_seguro_pwa",
  frontalPort: process.env.FRONTAL_PORT || 3000,
  targetNodes: [
    process.env.NODE_1_URL || "http://localhost:3001",
    process.env.NODE_2_URL || "http://localhost:3002",
    process.env.NODE_3_URL || "http://localhost:3003",
  ],
};
