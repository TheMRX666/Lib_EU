const Book = require("../models/book");
const BookInstance = require("../models/bookInstance")
const Author = require("../models/author");
const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");


exports.index = asyncHandler(async (req, res, next) => {
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Домашня сторінка Local Library",
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

exports.book_list = asyncHandler(async (req, res) => {
  const authorQuery = req.query.author;

  const filter = authorQuery
    ? { 
        author: await Author.findOne({
          $or: [
            { first_name: new RegExp(authorQuery, 'i') },
            { family_name: new RegExp(authorQuery, 'i') }
          ]
        }).select('_id')
      }
    : {};

  const allBooks = await Book.find(filter, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", {
    title: "Список книг",
    book_list: allBooks,
    author_query: authorQuery || "",
  });
});

exports.book_detail = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate("author", "first_name family_name").populate("genre", "name");
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

exports.book_create_post = asyncHandler(async (req, res) => {
  const { title, author, summary, isbn, genre } = req.body;
  const book = new Book({ title, author, summary, isbn, genre });
  const savedBook = await book.save();
  res.status(201).json(savedBook);
});

exports.book_update_post = asyncHandler(async (req, res) => {
  const { title, author, summary, isbn, genre } = req.body;
  const updatedBook = await Book.findByIdAndUpdate(
    req.params.id,
    { title, author, summary, isbn, genre },
    { new: true, runValidators: true }
  );
  if (!updatedBook) return res.status(404).json({ message: "Book not found" });
  res.json(updatedBook);
});

exports.book_delete_post = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted successfully" });
});
