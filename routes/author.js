const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

router.get('/', authorController.author_list);
router.post('/', authorController.author_create_post);

router.get("/:id/delete", authorController.author_delete_get);
router.post("/:id/delete", authorController.author_delete_post);

router.get('/:id', authorController.author_detail);

module.exports = router;
