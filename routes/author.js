const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.author_list);
router.post('/', authorController.author_create_post);
router.get('/:id', authorController.author_detail);
router.post('/:id/update', authorController.author_update_post);
router.post('/:id/delete', authorController.author_delete_post);

module.exports = router;
