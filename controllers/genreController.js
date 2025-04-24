const Genre = require("../models/genre");
const asyncHandler = require("express-async-handler");

exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find();
  res.json(genres);
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.status(404).json({ message: "Genre not found" });
  }
  res.json(genre);
});

exports.genre_create_post = asyncHandler(async (req, res, next) => {
  const genre = new Genre({
    name: req.body.name,
  });

  try {
    const newGenre = await genre.save();
    res.status(201).json(newGenre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
