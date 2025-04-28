// routes/postRoutes.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// CRUD endpoints
router.post('/posts', isAuthenticated, postController.createPost);
router.get('/posts', postController.getAllPosts);
router.put('/posts/:id', isAuthenticated, postController.updatePost);
router.delete('/posts/:id', isAuthenticated, postController.deletePost);

// Search endpoint
router.get('/posts/search', postController.searchPosts);

module.exports = router;
