import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const generateToken = async (payload) => {
  const token = await jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};

export const refreshToken = async (payload) => {
  const refreshToken = await jwt.sign(payload, secretKey, { expiresIn: "3h" });
  return refreshToken;
};
