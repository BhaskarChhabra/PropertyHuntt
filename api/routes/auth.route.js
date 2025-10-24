import express from "express";
import passport from "passport";
import { login, logout, register } from "../controllers/auth.controller.js";
import "../lib/googleStrategy.js"; // initializes the Google strategy
import { getCurrentUser } from "../controllers/auth.controller.js";
const router = express.Router();

// ------------------------
// Existing user auth routes
// ------------------------
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ------------------------
// Google OAuth routes
// ------------------------

// Step 1: User clicks “Sign in with Google”
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account consent"
  })
);

router.get("/me", getCurrentUser);

// Step 2: Google redirects back after authentication
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { user, token } = req.user;

    // Send JWT to client via HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .redirect(`https://property-huntt-prvt.vercel.app/?token=${token}`); // <-- UPDATED: redirect to your production frontend!
  }
);

export default router;
