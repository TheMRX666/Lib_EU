var express = require('express');
var router = express.Router();
const bookController = require("../controllers/bookController")

router.get("/", bookController.index);

module.exports = router;