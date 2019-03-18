const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const router = express.Router();

// Load post validation
const validatePostInput = require('../../validation/post');

//@route GET api/posts
//@desc Get all posts route
//@access Public
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });

      return res.json(posts);
    } catch (err) {
      return res.status(404).json({ nopostsfound: 'No posts found' });
    }
  }
);

//@route GET api/post/:id
//@desc Get single post by id route
//@access Public
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).sort({ date: -1 });

      return res.json(post);
    } catch (err) {
      return res.status(404).json({ nopostfound: 'No post found' });
    }
  }
);
//@route POST api/posts
//@desc Create post route
//@access Public
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // if any erros send 400 with errors obj
      return res.status(400).json(errors);
    }
    try {
      const newPost = await new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user._id
      }).save();

      return res.json(newPost);
    } catch (err) {
      console.log(err);
    }
    return res.json({
      message: 'posts works'
    });
  }
);

//@route DELETE api/post/:id
//@desc DELETE single post by id route
//@access Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      const post = await Post.findById(req.params.id);

      //Check for post owner

      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ notAuth: 'User not authorized' });
      }
      //Delete

      const result = await post.remove();
      return res.json({ success: true });
    } catch (err) {
      return res.status(404).json({ nopostfound: 'No post found' });
    }
  }
);
// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const post = await Post.findById(req.params.id);

      if (
        post.likes.filter(like => like.user.toString() === req.user.id)
          .length === 0
      ) {
        return res
          .status(400)
          .json({ notliked: 'You have not yet liked this post' });
      }

      // Get remove index
      const removeIndex = post.likes.map(item => item.user.toString());

      // .indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);

      // Save
      const removedPost = await post.save();
      return res.json(removedPost);
    } catch (err) {
      res.status(404).json({ postnotfound: 'No post found' });
    }
  }
);

//@route POST api/posts
//@desc Create post route
//@access Public
router.post(
  '/like/:post_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user._id });
      const post = await Post.findById(req.params.post_id);

      if (
        post.likes.filter(like => like.user.toString() === req.user._id)
          .length > 0
      ) {
        return res
          .status(400)
          .json({ alreadyliked: 'User alreay liked this post' });
      }
      //Add user id to likes

      post.likes.unshift({ user: req.user._id });
      const updatedPost = await post.save();
      return res.json(updatedPost);
    } catch (err) {
      return res.status(404).json({ nopostfound: 'No post found' });
    }
  }
);

//@route POST api/posts/comment/:id
//@desc Add comment to post route
//@access Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // if any erros send 400 with errors obj
      return res.status(400).json(errors);
    }
    try {
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user._id
      };

      //Add to comments array

      post.comments.unshift(newComment);
      //Save

      const savedPost = await post.save();
      return res.json(savedPost);
    } catch (err) {
      return res.status(404).json({ nopostfound: 'No post found' });
    }
  }
);

//@route DELETE api/posts/comment/:id/:comment_id
//@desc Delete comment from post route
//@access Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      // if any erros send 400 with errors obj
      return res.status(400).json(errors);
    }
    try {
      const post = await Post.findById(req.params.id);
      // Check if comment exist
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res
          .status(404)
          .json({ nocommentfound: 'Comment does not exist' });
      }
      // Get remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // Splice comment out of array
      post.comments.splice(removeIndex, 1);

      const savedPost = await post.save();
      return res.json(savedPost);
    } catch (err) {
      return res.status(404).json({ nopostfound: 'No post found' });
    }
  }
);
module.exports = router;
