const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

exports.author_list = asyncHandler(async (req, res, next) => {
  const name = req.query["name"];

  let query = {};
  if (name) {
    const regex = new RegExp(name, "i");
    query = {
      $or: [
        { first_name: regex },
        { family_name: regex }
      ]
    };
  }

  const authors = await Author.find(query)
    .sort({ family_name: 1 })
    .exec();

  res.render("author_list", {
    title: "Список авторів",
    author_list: authors,
    search_name: name || ""
  });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    const err = new Error("Автор не знайдений");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Деталі автора",
    author: author,
    author_books: allBooksByAuthor,
  });
});


exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.send("Author create GET - form (not needed for API)");
});

exports.author_create_post = asyncHandler(async (req, res, next) => {
  const { first_name, family_name, date_of_birth, date_of_death } = req.body;

  const author = new Author({
    first_name,
    family_name,
    date_of_birth,
    date_of_death,
  });

  const savedAuthor = await author.save();
  res.status(201).json(savedAuthor);
});

exports.author_delete_get = asyncHandler(async (req, res, next) => {
  res.send("Author delete GET - form (not needed for API)");
});

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id);
  if (!author) return res.status(404).json({ message: "Author not found" });

  const books = await Book.find({ author: req.params.id });
  if (books.length > 0)
    return res.status(400).json({ message: "Author has books. Cannot delete." });

  await Author.findByIdAndDelete(req.params.id);
  res.json({ message: "Author deleted successfully" });
});

exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("Author update GET - form (not needed for API)");
});

exports.author_update_post = asyncHandler(async (req, res, next) => {
  const { first_name, family_name, date_of_birth, date_of_death } = req.body;

  const updatedAuthor = await Author.findByIdAndUpdate(
    req.params.id,
    {
      first_name,
      family_name,
      date_of_birth,
      date_of_death,
    },
    { new: true, runValidators: true }
  );

  if (!updatedAuthor)
    return res.status(404).json({ message: "Author not found" });

  res.json(updatedAuthor);
});
