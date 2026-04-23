const express = require('express');
const router = express.Router();
const { login, register, getAgents } = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', authenticate, requireAdmin, register); // only admins can create users
router.get('/agents', authenticate, requireAdmin, getAgents);

module.exports = router;
