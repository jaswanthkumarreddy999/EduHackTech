const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    getEvents,
    getAllEventsAdmin,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
} = require('./event.controller');

// Public Routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Admin Routes (Protected)
router.get('/admin/all', protect, authorize('admin'), getAllEventsAdmin);
router.post('/admin', protect, authorize('admin'), createEvent);
router.put('/admin/:id', protect, authorize('admin'), updateEvent);
router.delete('/admin/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;
