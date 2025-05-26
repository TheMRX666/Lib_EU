const Book = require("../models/book");
const BookInstance = require("../models/bookInstance")
const Author = require("../models/author");
const Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");
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

exports.book_detail = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    const err = new Error("Книгу не знайдено");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});

exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("book_form", {
    title: "Створити книгу",
    authors: allAuthors,
    genres: allGenres,
  });
});

exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Назва не повинна бути порожньою.").trim().isLength({ min: 1 }).escape(),
  body("author", "Автор не повинен бути порожнім.").trim().isLength({ min: 1 }).escape(),
  body("summary", "Опис не повинен бути порожнім.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN не повинен бути порожнім.").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      for (const genre of allGenres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }

      res.render("book_form", {
        title: "Створити книгу",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      await book.save();
      res.redirect(book.url);
    }
  }),
];

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

exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author genre").exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    res.redirect("/catalog/book");
  }

  res.render("book_delete", {
    title: "Видалити книгу",
    book: book,
    book_instances: bookInstances,
  });
});

exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.body.bookid).exec(),
    BookInstance.find({ book: req.body.bookid }).exec(),
  ]);

  if (bookInstances.length > 0) {
    res.render("book_delete", {
      title: "Видалити книгу",
      book: book,
      book_instances: bookInstances,
    });
    return;
  } else {
    await Book.findByIdAndDelete(req.body.bookid);
    res.redirect("/catalog/book");
  }
});

