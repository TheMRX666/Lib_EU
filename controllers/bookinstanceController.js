const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const allBooks = await Book.find().sort({ title: 1 }).exec();

    res.render("bookinstance_form", {
      title: "Створити екземпляр книги",
      book_list: allBooks,
    });
  } catch (err) {
    return next(err);
  }
};

exports.bookinstance_create_post = [
  body("book", "Книга обов’язкова").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Видавництво обов’язкове").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Недійсна дата")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      try {
        const allBooks = await Book.find().sort({ title: 1 }).exec();

        return res.render("bookinstance_form", {
          title: "Створити екземпляр книги",
          book_list: allBooks,
          selected_book: req.body.book,
          bookinstance: bookInstance,
          errors: errors.array(),
        });
      } catch (err) {
        return next(err);
      }
    }

    try {
      await bookInstance.save();
      res.redirect(`/catalog/book/${bookInstance.book}`);
    } catch (err) {
      return next(err);
    }
  },
];


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
