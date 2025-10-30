const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

/**
 * GET /login
 */
exports.getLogin = (req, res) => {
  if (req.user) return res.redirect("/profile");
  res.render("login", { title: "Login" });
};

/**
 * POST /login
 * Uses passport-local; no DB callbacks here.
 */
exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email)) {
    validationErrors.push({ msg: "Please enter a valid email address." });
  }
  if (validator.isEmpty(req.body.password || "")) {
    validationErrors.push({ msg: "Password cannot be blank." });
  }
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }

  // Normalize email consistently
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("errors", info || { msg: "Login failed." });
      return res.redirect("/login");
    }
    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      req.flash("success", { msg: "Success! You are logged in." });
      return res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Passport 0.6 requires a callback.
 */
exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.log("Error destroying session during logout:", destroyErr);
      }
      req.user = null;
      return res.redirect("/");
    });
  });
};

/**
 * GET /signup
 */
exports.getSignup = (req, res) => {
  if (req.user) return res.redirect("/profile");
  res.render("signup", { title: "Create Account" });
};

/**
 * POST /signup
 * Mongoose v7+ (no callbacks) — async/await only.
 */
exports.postSignup = async (req, res, next) => {
  try {
    // Basic validation
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) {
      validationErrors.push({ msg: "Please enter a valid email address." });
    }
    if (!validator.isLength(req.body.password || "", { min: 6 })) {
      validationErrors.push({ msg: "Password must be at least 6 characters." });
    }
    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/signup");
    }

    // Normalize email
    const email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });
    const name = (req.body.name || "").trim();
    const password = req.body.password;

    // 1) Check for existing user
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      req.flash("errors", { msg: "Account with that email already exists." });
      return res.redirect("/signup");
    }

    // 2) Create and save user (hashing handled by model pre('save') if defined)
    const user = new User({ email, password, name });
    await user.save();

    // 3) Log them in
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/profile");
    });
  } catch (err) {
    return next(err);
  }
};
