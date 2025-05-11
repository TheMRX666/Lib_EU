const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Список жанрів",
    genre_list: allGenres,
  });
});

exports.genre_detail = asyncHandler(async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).json({ message: "Genre not found" });

  const books = await Book.find({ genre: genre._id }, "title");
  res.json({ genre, books });
});

exports.genre_create_post = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const genre = new Genre({ name });
  const savedGenre = await genre.save();
  res.status(201).json(savedGenre);
});

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