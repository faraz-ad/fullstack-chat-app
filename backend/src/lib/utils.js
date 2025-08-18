import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // prevent XSS attacks
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
    secure: process.env.NODE_ENV === "production", // Require HTTPS in production
    path: "/", // Make cookie available on all paths
  };

  // For cross-domain authentication between Vercel and Northflank
  if (process.env.NODE_ENV === "production" && process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL);
      // Don't set domain for cross-domain cookies, let the browser handle it
      // The sameSite: 'none' and secure: true will allow cross-domain cookies
    } catch (error) {
      console.warn("Invalid FRONTEND_URL, using default cookie settings");
    }
  }

  res.cookie("jwt", token, cookieOptions);

  return token;
};
