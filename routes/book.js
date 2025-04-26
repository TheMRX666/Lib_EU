const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/", bookController.book_list);
router.get("/:id", bookController.book_detail);
router.post("/", bookController.book_create_post);
router.post("/:id/delete", bookController.book_delete_post);
router.post("/:id/update", bookController.book_update_post);

module.exports = router;
