// controllers/postController.js

const postModel = require('../models/postModel');
const sanitizeHtml = require('sanitize-html');

// CREATE POST
exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const sanitizedContent = sanitizeHtml(content);

  const post = await postModel.createPost(req.session.userId, title, sanitizedContent);
  res.json(post);
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  const posts = await postModel.getAllPosts();
  res.json(posts);
};

// UPDATE POST
exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  const sanitizedContent = sanitizeHtml(content);

  const post = await postModel.updatePost(req.params.id, title, sanitizedContent);
  res.json(post);
};

// DELETE POST
exports.deletePost = async (req, res) => {
  await postModel.deletePost(req.params.id);
  res.sendStatus(204);
};

// SEARCH POSTS
exports.searchPosts = async (req, res) => {
  const { keyword } = req.query;
  const posts = await postModel.searchPosts(keyword);
  res.json(posts);
};
