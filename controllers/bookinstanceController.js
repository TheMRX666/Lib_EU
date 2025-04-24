const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const instances = await BookInstance.find().populate("book");
  res.json(instances);
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const instance = await BookInstance.findById(req.params.id).populate("book");
  if (!instance) {
    return res.status(404).json({ message: "BookInstance not found" });
  }
  res.json(instance);
});

exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
  const instance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
  });

  try {
    const newInstance = await instance.save();
    res.status(201).json(newInstance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
