/**
 * Passport Configuration — Google OAuth 2.0 Strategy
 *
 * Week 6 — Authenticates users via Google and creates/finds accounts in MongoDB.
 *          Gracefully skips if GOOGLE_CLIENT_ID is not configured.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Initialize Passport with Google OAuth strategy.
 * Only registers the strategy if environment variables are set.
 */
const initializePassport = () => {
  // Serialize user ID into session/token
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Only register Google strategy if credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Google OAuth not configured — skipping Passport Google strategy');
    console.log('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable\n');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email (link accounts)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0]?.value || null;
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || null,
            role: 'owner',
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  console.log('✅ Google OAuth strategy registered\n');
};

module.exports = { initializePassport };
