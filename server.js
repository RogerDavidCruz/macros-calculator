require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const app = express();

const port = process.env.PORT || 9090; // will read from .env now
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

// If running behind a proxy (Render/Heroku/etc.), trust the proxy in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// TEMP sanity checks — remove after it works
console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("PORT     =", process.env.PORT);
console.log("DB_STRING defined? ", Boolean(process.env.DB_STRING));

// Passport config
require("./config/passport")(passport);

// Connect to database
connectDB();

// Using EJS for views
app.set("view engine", "ejs");

// Static folder
app.use(express.static("public"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

// Use forms for PUT/DELETE
app.use(methodOverride("_method"));

// Set up sessions - stored in MongoDB
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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Routes
app.use("/", mainRoutes);
app.use("/post", postRoutes);

// Server
app.listen(port, () => {
  console.log(
    `Server is running smoothly, keep up the pace on localhost: ${port}`
  );
});
