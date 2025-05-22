const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Список жанрів",
    genre_list: allGenres,
  });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    const err = new Error("Жанр не знайдено");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Деталі жанру",
    genre: genre,
    genre_books: booksInGenre,
  });
});

exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Створити жанр" });
};


exports.genre_create_post = [
  body("name", "Назва жанру повинна містити мінімум 3 символи.")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      return res.render("genre_form", {
        title: "Створити жанр",
        genre,
        errors: errors.array(),
      });
    }

    const existingGenre = await Genre.findOne({
      name: req.body.name,
    }).collation({ locale: "en", strength: 2 });

    if (existingGenre) {
      return res.redirect(existingGenre.url);
    }

    await genre.save();
    res.redirect(genre.url);
  })
];


exports.genre_update_post = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updatedGenre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );
  if (!updatedGenre) return res.status(404).json({ message: "Genre not found" });
  res.json(updatedGenre);
});

exports.genre_delete_post = asyncHandler(async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).json({ message: "Genre not found" });

  const books = await Book.find({ genre: genre._id });
  if (books.length > 0)
    return res.status(400).json({
      message: "Genre has associated books. Cannot delete.",
      books: books.map(b => ({ title: b.title, id: b._id }))
    });

  await Genre.findByIdAndDelete(req.params.id);
  res.json({ message: "Genre deleted successfully" });
});