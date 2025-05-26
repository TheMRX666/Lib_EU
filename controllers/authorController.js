const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
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


exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Створити автора" });
};

exports.author_create_post = [
  body("first_name")
    .trim().isLength({ min: 1 })
    .escape().withMessage("Ім'я повинно бути вказано.")
    .isAlphanumeric().withMessage("Ім'я містить неалфанумерні символи."),
  body("family_name")
    .trim().isLength({ min: 1 })
    .escape().withMessage("Прізвище повинно бути вказано.")
    .isAlphanumeric().withMessage("Прізвище містить неалфанумерні символи."),
  body("date_of_birth", "Невірна дата народження")
    .optional({ checkFalsy: true })
    .isISO8601().toDate(),
  body("date_of_death", "Невірна дата смерті")
    .optional({ checkFalsy: true })
    .isISO8601().toDate(),

asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { first_name, family_name, date_of_birth, date_of_death } = req.body;

    const author = new Author({
      first_name,family_name,
      date_of_birth,date_of_death,
    });

   if (!errors.isEmpty()) {
      return res.render("author_form", {
        title: "Створити автора",
        author,
        errors: errors.array(),
      });
    }

    await author.save();

    res.render("author_form", {
      title: "Створити автора",
      author: {},
      success: "Автор успішно створений!",
    });
  })
];

exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Ім'я повинно бути вказано.")
    .isAlphanumeric()
    .withMessage("Ім'я містить неалфанумерні символи."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Прізвище повинно бути вказано.")
    .isAlphanumeric()
    .withMessage("Прізвище містить неалфанумерні символи."),
  body("date_of_birth", "Невірна дата народження")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Невірна дата смерті")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAuthor)
      return res.status(404).json({ message: "Author not found" });

    res.json(updatedAuthor);
  }),
];

exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    res.redirect("/catalog/author");
  }

  res.render("author_delete", {
    title: "Видалити автора",
    author: author,
    author_books: allBooksByAuthor,
  });
});

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.body.authorid).exec(),
    Book.find({ author: req.body.authorid }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Видалити автора",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/author");
  }
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
