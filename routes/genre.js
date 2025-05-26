const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");

router.get("/", genreController.genre_list);
router.get("/:id", genreController.genre_detail);
router.post("/", genreController.genre_create_post);
router.get("/:id/delete", genreController.genre_delete_get);
router.post("/:id/delete", genreController.genre_delete_post);
router.post("/:id/update", genreController.genre_update_post);

module.exports = router;
