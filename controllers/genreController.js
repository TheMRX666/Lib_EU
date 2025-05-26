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

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);

  if (genre === null) {
    res.redirect("/catalog/genre");
  }

  res.render("genre_delete", {
    title: "Видалити жанр",
    genre: genre,
    genre_books: booksWithGenre,
  });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.body.genreid).exec(),
    Book.find({ genre: req.body.genreid }).exec(),
  ]);

  if (booksWithGenre.length > 0) {
    res.render("genre_delete", {
      title: "Видалити жанр",
      genre: genre,
      genre_books: booksWithGenre,
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genre");
  }
});
