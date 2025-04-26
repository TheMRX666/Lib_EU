const express = require("express");
const router = express.Router();
const bookInstanceController = require("../controllers/bookinstanceController");

router.get("/", bookInstanceController.bookinstance_list);
router.get("/:id", bookInstanceController.bookinstance_detail);
router.post("/", bookInstanceController.bookinstance_create_post);
router.post("/:id/delete", bookInstanceController.bookinstance_delete_post);
router.post("/:id/update", bookInstanceController.bookinstance_update_post);

module.exports = router;
