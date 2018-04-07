let express = require('express');
let app = express();
let path = require('path');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let logger = require("morgan");
let passport = require("passport");
let LocalStrategy = require('passport-local').Strategy;
let cookieParser = require("cookie-parser");

require('./config/passport')(passport);

app.use(logger("dev"));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/express-blog');
let db = mongoose.connection;

// Handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
// Conneceted to mongodb
db.once('open', () => {
  console.log('Connected to database!');
});

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie Parser
app.use(cookieParser());

// Use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  // store: new MongoStore({
  //   mongooseConnection: db
  // })
}));

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Serve static files - html, css and images
app.use(express.static(__dirname + '/static'));

// Include routes
let routes = require('./routes/router');
app.use('/', routes);

let auth = require('./routes/auth')(passport);
app.use('/auth', auth);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Error handler
// Define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

// Render static index
app.get("/", (req, res) => {
    res.render("index");
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Express app listening on port 3000');
});
