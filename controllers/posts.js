const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      
      // Create todal daily energy expendenture
      // Men: calories/day = 10 * weight(kg) + 6.25 x height (cm) - 5 x age(years) + 5 * (activity level)
      const tdeeNum = (10 * req.body.weight) + (6.25 * req.body.height) - (5 * req.body.age) + 5;
      //1787.5 calories/day TDEE //Roger

      // Women: calories/day = 10 x weight (kg) + 6.25 x height (cm) – 5 x age (y) – 161

      //conditional if male use male calculation, if female use female calculation


      await Post.create({
        weight: req.body.weight,
        height: req.body.height,
        age: req.body.age,
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
      console.log(err);
    }
  },
  likePost: async (req, res) => {

    console.log(req, 'AIRPLANE')
    
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  ateProtein: async (req, res) => {

    console.log(req, 'protein')
    
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          protein: true,
        }
      );
      console.log("protein true");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  ateCarbohydrates: async (req, res) => {
    console.log(req, 'carbohydrates')
      try {
        await Post.findOneAndUpdate(
          { _id: req.params.id},
          {
            carbohydrates: true,
          }
        );
        console.log("ateCarbohydrates");
        res.redirect(`/post/${req.params.id}`);
      } catch (err) {
        console.log(err)
      }  
  },
  ateFats: async (req, res) => {
    console.log(req, 'carbohydrates')

    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id},
        {
          fats: true,
        }
      );
      console.log("ateCarbohydrates");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err)
    }
  },
  updateStats: async (req, res) => {
    console.log('updating measurements');
    try {
      await Post.findOneAndUpdate(
        {_id: req.params.id},
        {weight: req.body.weight},
        {height: req.body.height},
        {age: req.body.age},
        {tdee: tdeeNum},
      );
      console.log("update measurements");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
