const express = require("express");
const router = express.Router();
const bookInstanceController = require("../controllers/bookinstanceController");

router.get("/", bookInstanceController.bookinstance_list);
router.get("/create", bookInstanceController.bookinstance_create_get);
router.post("/create", bookInstanceController.bookinstance_create_post);
router.post("/:id/delete", bookInstanceController.bookinstance_delete_post);
router.post("/:id/update", bookInstanceController.bookinstance_update_post);
router.get("/:id", bookInstanceController.bookinstance_detail);

module.exports = router;
