const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.bookinstance_list = asyncHandler(async (req, res) => {
  try {
    const allBookInstances = await BookInstance.find()
      .populate("book")
      .exec();

    const statusClass = (status) => {
      switch (status) {
        case "Available":
          return "text-success";
        case "Maintenance":
          return "text-danger";
        case "Loaned":
          return "text-warning";
        case "Reserved":
          return "text-warning";
        default:
          return "";
      }
    };

    res.render("bookinstance_list", {
      title: "Список екземплярів книг",
      bookinstance_list: allBookInstances,
      statusClass, 
    });
  } catch (err) {
    return next(err);
  }
});

exports.bookinstance_detail = asyncHandler(async (req, res) => {
  const instance = await BookInstance.findById(req.params.id).populate("book", "title");
  if (!instance) return res.status(404).json({ message: "BookInstance not found" });
  res.json(instance);
});

exports.bookinstance_create_post = asyncHandler(async (req, res) => {
  const { book, imprint, status, due_back } = req.body;
  const instance = new BookInstance({ book, imprint, status, due_back });
  const savedInstance = await instance.save();
  res.status(201).json(savedInstance);
});

exports.bookinstance_update_post = asyncHandler(async (req, res) => {
  const { book, imprint, status, due_back } = req.body;
  const updatedInstance = await BookInstance.findByIdAndUpdate(
    req.params.id,
    { book, imprint, status, due_back },
    { new: true, runValidators: true }
  );
  if (!updatedInstance) return res.status(404).json({ message: "BookInstance not found" });
  res.json(updatedInstance);
});

exports.bookinstance_delete_post = asyncHandler(async (req, res) => {
  const instance = await BookInstance.findById(req.params.id);
  if (!instance) return res.status(404).json({ message: "BookInstance not found" });
  await BookInstance.findByIdAndDelete(req.params.id);
  res.json({ message: "BookInstance deleted successfully" });
});
