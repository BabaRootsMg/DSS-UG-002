
const express = require('express');
const router  = express.Router();
const post    = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// All latest posts
router.get('/', isAuthenticated, post.getAllPosts);

// My posts
router.get('/my', isAuthenticated, post.getMyPosts);

// New‐post form
router.get('/new', isAuthenticated, post.showCreateForm);

// Create post
router.post('/', isAuthenticated, post.createPost);

// Edit form
router.get('/:id/edit', isAuthenticated, post.showEditForm);

// Update post
router.post('/:id', isAuthenticated, post.updatePost);

// Delete post
router.post('/:id/delete', isAuthenticated, post.deletePost);

// Search post
router.get('/search', isAuthenticated, post.searchPosts);

module.exports = router;
