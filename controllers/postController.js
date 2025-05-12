// controllers/postController.js

const postModel    = require('../models/postModel');
const sanitizeHtml = require('sanitize-html');

// GET /posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const rows = await postModel.getAllPosts();
    // normalize field names for the template
    const posts = rows.map(p => ({
      id:        p.id,
      title:     p.title,
      content:   p.content,
      username:  p.username,   
      timestamp: p.timestamp   
    }));
    res.render('posts', {
      user:  req.user,
      posts
    });
  } catch (err) {
    next(err);
  }
};

// GET /posts/my
exports.getMyPosts = async (req, res, next) => {
  try {
    const rows = await postModel.getPostsByUser(req.user.id);
    const userPosts = rows.map(p => ({
      id:        p.id,
      title:     p.title,
      content:   p.content,
      timestamp: p.timestamp  
    }));
    res.render('my_posts', {
      user:      req.user,
      userPosts
    });
  } catch (err) {
    next(err);
  }
};

// Show Create Post form (GET /posts/new)
exports.showCreateForm = (req, res) => {
  res.render('createPost', {
    error:     null,
    csrfToken: req.csrfToken()
  });
};

// Handle Create Post (POST /posts)
exports.createPost = async (req, res, next) => {
  let { title, content } = req.body;
  if (!title || !content) {
    return res.render('createPost', {
      error:     'Title and content are required.',
      csrfToken: req.csrfToken()
    });
  }

  // Sanitize title and content against XSS
  const cleanTitle   = sanitizeHtml(title,   { allowedTags: [], allowedAttributes: {} });
  const cleanContent = sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags, allowedAttributes: sanitizeHtml.defaults.allowedAttributes });

  try {
    await postModel.createPost(req.user.id, cleanTitle, cleanContent);
    // Redirect back to "My Posts" for consistency
    res.redirect('/posts/my');
  } catch (err) {
    next(err);
  }
};

// Show Edit Post form (GET /posts/:id/edit)
exports.showEditForm = async (req, res, next) => {
  try {
    const p = await postModel.getPostById(req.params.id);
    res.render('editPost', {
      error:     null,
      post:      p,
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    next(err);
  }
};

// Handle Update Post (POST /posts/:id)
exports.updatePost = async (req, res, next) => {
  let { title, content } = req.body;

  // Sanitize both title and content
  const cleanTitle   = sanitizeHtml(title,   { allowedTags: [], allowedAttributes: {} });
  const cleanContent = sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags, allowedAttributes: sanitizeHtml.defaults.allowedAttributes });

  try {
    await postModel.updatePost(req.params.id, cleanTitle, cleanContent);
    // Redirect back to "My Posts"
    res.redirect('/posts/my');
  } catch (err) {
    next(err);
  }
};

// Handle Delete Post (POST /posts/:id/delete)
exports.deletePost = async (req, res, next) => {
  try {
    await postModel.deletePost(req.params.id);
    // Redirect back to "My Posts"
    res.redirect('/posts/my');
  } catch (err) {
    next(err);
  }
};

// Handle Search Posts (GET /posts/search?keyword=…)
exports.searchPosts = async (req, res, next) => {
  try {
    const rows = await postModel.searchPosts(req.query.keyword || '');
    const posts = rows.map(p => ({
      id:        p.id,
      title:     p.title,
      content:   p.content,
      username:  p.username,
      timestamp: p.timestamp
    }));
    res.render('posts', {
      user:  req.user,
      posts
    });
  } catch (err) {
    next(err);
  }
};
