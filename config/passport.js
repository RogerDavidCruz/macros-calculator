const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

module.exports = function (passport) {
  // Local email/password strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        // 1) Find user (no callbacks)
        const user = await User.findOne({ email: email.toLowerCase() }).exec();
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }

        // If account was created with an OAuth provider and has no password
        if (!user.password) {
          return done(null, false, {
            msg:
              "Your account was registered using a sign-in provider. " +
              "To enable password login, sign in using that provider, then set a password in your profile.",
          });
        }

        // 2) Compare password
        let isMatch = false;

        if (typeof user.comparePassword === "function") {
          // Support either callback-style comparePassword(candidate, cb) or promise-style comparePassword(candidate)
          if (user.comparePassword.length >= 2) {
            isMatch = await new Promise((resolve, reject) =>
              user.comparePassword(password, (err, ok) => (err ? reject(err) : resolve(ok)))
            );
          } else {
            isMatch = await user.comparePassword(password);
          }
        } else {
          // Fallback (not recommended; only if passwords are stored in plaintext)
          isMatch = user.password === password;
        }

        if (!isMatch) {
          return done(null, false, { msg: "Invalid email or password." });
        }

        // 3) Success
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user id into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user by id (no callbacks)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).exec();
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
