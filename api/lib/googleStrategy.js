import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        // Try to find existing user by email
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Try to make sure username is unique
          let baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase(); // "John Doe" -> "johndoe"
          let uniqueUsername = baseUsername;
          let i = 1;
          // Check for existing username, if exists, append number or use Google id
          while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`; // johndoe1234
            i++;
            // avoid infinite loop, switch to Google sub id if needed
            if (i > 5) {
              uniqueUsername = profile.id;
              break;
            }
          }
          user = await prisma.user.create({
            data: {
              email,
              username: uniqueUsername,
              password: "", // not used for Google users
              avatar: profile.photos[0].value,
            },
          });
        }

        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "7d" }
        );

        return done(null, { user, token });
      } catch (err) {
        done(err, false);
      }
    }
  )
);
