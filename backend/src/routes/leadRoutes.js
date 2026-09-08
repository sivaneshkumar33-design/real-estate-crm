const express = require('express');

const router = express.Router();

const leadController = require('../controllers/leadController');

const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get(
    '/',
    leadController.getLeads
);


router.get(
    '/:id',
    leadController.getLeadById
);


router.post(
    '/',
    leadController.createLead
);


router.put(
    '/:id',
    leadController.updateLead
);


// Delete lead
router.delete(
    '/:id',
    leadController.deleteLead
);


module.exports = router;