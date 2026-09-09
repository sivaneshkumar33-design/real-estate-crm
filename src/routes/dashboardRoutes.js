const express = require('express');

const {
    getDashboard
} = require('../controllers/dashboardController');

const {
    authenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getDashboard);

module.exports = router;