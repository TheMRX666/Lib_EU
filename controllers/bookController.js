const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await Book.find().populate("author genre");
  res.json(books);
});

exports.book_detail = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author genre");
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book);
});

exports.book_create_post = asyncHandler(async (req, res, next) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre,
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
