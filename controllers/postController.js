// controllers/postController.js

const postModel = require('../models/postModel');
const sanitizeHtml = require('sanitize-html');

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const sanitizedContent = sanitizeHtml(content);

    const post = await postModel.createPost(req.session.userId, title, sanitizedContent);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post');
  }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching posts');
  }
};

// UPDATE POST
exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const sanitizedContent = sanitizeHtml(content);

    const post = await postModel.updatePost(req.params.id, title, sanitizedContent);
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating post');
  }
};

// DELETE POST
exports.deletePost = async (req, res) => {
  try {
    await postModel.deletePost(req.params.id);
    res.sendStatus(204); // No Content
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting post');
  }
};

// SEARCH POSTS
exports.searchPosts = async (req, res) => {
  try {
    const { keyword } = req.query;
    const posts = await postModel.searchPosts(keyword);
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching posts');
  }
};
