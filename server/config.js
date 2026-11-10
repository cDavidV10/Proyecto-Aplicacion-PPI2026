import dotenv from "dotenv";

dotenv.config();

export const config = {
  frontalPort: Number(process.env.FRONTAL_PORT) || 3000,
  targetNodes: [
    process.env.NODE_1_URL,
    process.env.NODE_2_URL,
    process.env.NODE_3_URL,
  ].filter(Boolean),
};
