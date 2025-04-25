const connectDB = require('./connection/db');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bookRouter = require('./routes/book');
const authorRouter = require('./routes/author');
const genreRouter = require('./routes/genre');
const bookInstanceRouter = require('./routes/bookinstance');
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var my_pageRouter = require("./routes/my_page");

var app = express();
// Connect to MongoDB
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', my_pageRouter);
app.use('/catalog/book', bookRouter);
app.use('/catalog/author', authorRouter);
app.use('/catalog/genre', genreRouter);
app.use('/catalog/bookinstance', bookInstanceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

module.exports = app;
