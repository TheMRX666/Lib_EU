const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");

router.get("/", genreController.genre_list);
router.get("/:id", genreController.genre_detail);
router.post("/", genreController.genre_create_post);

module.exports = router;
