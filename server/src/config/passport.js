const passport      = require('passport');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({
        $or: [
          { googleId: profile.id },
          ...(email ? [{ email }] : []),
        ],
      });
      if (user) {
        if (!user.googleId) { user.googleId = profile.id; await user.save(); }
        return done(null, user);
      }
      user = await User.create({
        googleId:    profile.id,
        email,
        displayName: profile.displayName,
        avatarUrl:   profile.photos?.[0]?.value,
        subscriptionTier: 'free',
        scanCount: 0,
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID:      process.env.FACEBOOK_CLIENT_ID,
    clientSecret:  process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL:   process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({
        $or: [
          { facebookId: profile.id },
          ...(email ? [{ email }] : []),
        ],
      });
      if (user) {
        if (!user.facebookId) { user.facebookId = profile.id; await user.save(); }
        return done(null, user);
      }
      user = await User.create({
        facebookId:  profile.id,
        email,
        displayName: `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim(),
        avatarUrl:   profile.photos?.[0]?.value,
        subscriptionTier: 'free',
        scanCount: 0,
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
