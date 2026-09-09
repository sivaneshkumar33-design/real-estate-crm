const express = require('express');

const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    createUnit,
    updateUnit
} = require('../controllers/propertyController');

const {
    authenticate,
    authorize
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getProperties);

router.get('/:id', getProperty);

router.post(
    '/',
    authorize('ADMIN'),
    createProperty
);

router.put(
    '/:id',
    authorize('ADMIN'),
    updateProperty
);

router.delete(
    '/:id',
    authorize('ADMIN'),
    deleteProperty
);

router.post(
    '/:propertyId/units',
    authorize('ADMIN'),
    createUnit
);

router.put(
    '/units/:id',
    authorize('ADMIN'),
    updateUnit
);

module.exports = router;