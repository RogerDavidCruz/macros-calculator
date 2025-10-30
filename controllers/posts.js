const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");

/**
 * Helper to calculate TDEE (Mifflin–St Jeor).
 * Currently uses the male offset (+5). Adjust if you later add gender-specific logic.
 */
function calcTDEE({ weight, height, age }) {
  const w = Number(weight) || 0;   // kg
  const h = Number(height) || 0;   // cm
  const a = Number(age) || 0;      // years
  return 10 * w + 6.25 * h - 5 * a + 5;
}

module.exports = {
  // GET /profile
  getProfile: async (req, res, next) => {
    try {
      if (!req.user) return res.redirect("/login");
      const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
      res.render("profile.ejs", { posts, user: req.user });
    } catch (err) {
      next(err);
    }
  },

  // GET /feed
  getFeed: async (req, res, next) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }).lean();
      res.render("feed.ejs", { posts });
    } catch (err) {
      next(err);
    }
  },

  // GET /post/:id
  getPost: async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id).lean();
      if (!post) return res.status(404).render("post.ejs", { post: null, user: req.user });
      res.render("post.ejs", { post, user: req.user });
    } catch (err) {
      next(err);
    }
  },

  // POST /post (multipart form with image)
  createPost: async (req, res, next) => {
    try {
      // 1) Upload image to Cloudinary (req.file provided by multer)
      const result = await cloudinary.uploader.upload(req.file.path);

      // 2) Calculate TDEE
      const tdeeNum = calcTDEE({
        weight: req.body.weight,
        height: req.body.height,
        age: req.body.age,
      });

      // 3) Persist
      await Post.create({
        system: req.body.system,
        gender: req.body.gender,
        age: req.body.age,
        weight: req.body.weight,
        height: req.body.height,
        activityLevel: req.body.activityLevel,
        tdee: tdeeNum,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        likes: 0,
        protein: false,
        carbohydrates: false,
        fats: false,
        user: req.user.id,
      });

      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      next(err);
    }
  },

  // PUT /post/:id/like
  likePost: async (req, res, next) => {
    try {
      await Post.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  // PUT /post/:id/protein
  ateProtein: async (req, res, next) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, { protein: true }, { new: true });
      console.log("protein true");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  // PUT /post/:id/carbohydrates
  ateCarbohydrates: async (req, res, next) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, { carbohydrates: true }, { new: true });
      console.log("carbohydrates true");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  // PUT /post/:id/fats
  ateFats: async (req, res, next) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, { fats: true }, { new: true });
      console.log("fats true");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  // PUT /post/:id (update measurements)
  updateStats: async (req, res, next) => {
    try {
      const tdeeNum = calcTDEE({
        weight: req.body.weight,
        height: req.body.height,
        age: req.body.age,
      });

      await Post.findByIdAndUpdate(
        req.params.id,
        {
          weight: req.body.weight,
          height: req.body.height,
          age: req.body.age,
          tdee: tdeeNum,
        },
        { new: true }
      );

      console.log("Updated measurements");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /post/:id
  deletePost: async (req, res, next) => {
    try {
      // 1) Find post first to get Cloudinary public_id
      const post = await Post.findById(req.params.id).lean();
      if (!post) {
        console.log("Post not found");
        return res.redirect("/profile");
      }

      // 2) Delete image from Cloudinary (if exists)
      if (post.cloudinaryId) {
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }

      // 3) Delete post from DB
      await Post.deleteOne({ _id: req.params.id });

      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      next(err);
    }
  },
};
