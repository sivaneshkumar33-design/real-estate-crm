const express = require('express');

const {
    getBookings,
    createBooking,
    cancelBooking
} = require('../controllers/bookingController');

const {
    authenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getBookings);

router.post('/', createBooking);

router.put('/:id/cancel', cancelBooking);

module.exports = router;