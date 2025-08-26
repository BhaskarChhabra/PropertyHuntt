// FILE: api/middleware/verifyToken.js

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  // We now use JWT_SECRET, which matches the key used to sign the token during login.
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    // --- THIS IS THE FIX ---
    // We log the specific error to the console for better debugging.
    if (err) {
      console.error("JWT Verification Error:", err.message); // Log the error
      return res.status(403).json({ message: "Token is not Valid!" });
    }
    
    // Attach the user's ID from the token to the request object
    req.userId = payload.id;
    
    next();
  });
};