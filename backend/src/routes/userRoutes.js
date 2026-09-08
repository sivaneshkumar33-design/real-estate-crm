const express = require('express');

const {
    getSalesUsers
} = require('../controllers/userController');

const {
    authenticate
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/sales', getSalesUsers);

module.exports = router;
