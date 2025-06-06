const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/", bookController.book_list);
router.get("/:id/delete", bookController.book_delete_get);
router.post("/:id/delete", bookController.book_delete_post);
router.get("/create", bookController.book_create_get);
router.post("/create", bookController.book_create_post);
router.post("/:id/update", bookController.book_update_post);
router.get("/:id", bookController.book_detail);

module.exports = router;
