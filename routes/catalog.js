var express = require('express');
var router = express.Router();
const bookController = require("../controllers/bookController")
const authorController = require("../controllers/authorController")
const genreController = require("../controllers/genreController")

router.get("/", bookController.index);

router.get("/author/create", authorController.author_create_get)
router.post("/author/create", authorController.author_create_post);

router.get("/genre/create", genreController.genre_create_get);
router.post("/genre/create", genreController.genre_create_post);

module.exports = router;