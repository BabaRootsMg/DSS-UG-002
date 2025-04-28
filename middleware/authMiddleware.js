const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/dashboard', isAuthenticated, authController.dashboard);
