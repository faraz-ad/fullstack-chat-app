import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // prevent XSS attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
    secure: process.env.NODE_ENV === "production", // Require HTTPS in production
    domain: process.env.NODE_ENV === "production" ? ".code.run" : undefined, // Allow subdomains in production
    path: "/", // Make cookie available on all paths
  });

  return token;
};
