require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const postRoutes = require("./routes/posts");

// If behind a proxy (Render/Heroku)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Debug info (safe to remove later)
console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("PORT     =", process.env.PORT);
console.log("DB_STRING defined?", Boolean(process.env.DB_STRING));

// Passport config
require("./config/passport")(passport);

// Connect to DB
connectDB();

// View engine
app.set("view engine", "ejs");

// Static folder
app.use(express.static("public"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

// Method override
app.use(methodOverride("_method"));

// Sessions (Mongo store)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard doge",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Prevent caching of authed pages (best before routes)
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Routes
app.use("/", mainRoutes);
app.use("/post", postRoutes);

// Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
