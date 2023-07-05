const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
var createError = require('http-errors');
var path = require('path');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const connectDatabase = require('./config/database');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const router = require('./routes');

connectDatabase();

const app = express();
app.use(cors({ origin: true }));

// app.use(express.static('public'));
app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.use('/', router);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerFile));



// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}`);
// });








// view engine setup


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));




app.use(notFound);
app.use(errorHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
