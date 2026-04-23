const express = require('express');
const router = express.Router();
const {
  getAllFields, getMyFields, getField,
  createField, updateField, deleteField,
  addUpdate, getDashboardStats
} = require('../controllers/fieldController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/', authenticate, requireAdmin, getAllFields);
router.get('/my', authenticate, getMyFields);
router.get('/:id', authenticate, getField);
router.post('/', authenticate, requireAdmin, createField);
router.put('/:id', authenticate, requireAdmin, updateField);
router.delete('/:id', authenticate, requireAdmin, deleteField);
router.post('/:id/updates', authenticate, addUpdate);

module.exports = router;
