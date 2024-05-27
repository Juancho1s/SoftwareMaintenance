const path = require('path');
const fs = require("fs");
const morgan = require('morgan');



/* The `const dbCredentials` object is storing the credentials and configuration settings required to
connect to a MySQL database for an elevator management system. Here's a breakdown of the properties: */
const dbCredentials = {
  host: "localhost",
  username: "root",
  password: "123456789",
  database: "elevator_management_system",
  dialect: "mysql",
  define: {
    timestamps: false,
  },
};

/* `const logDirectory = path.join(__dirname, 'log')` is creating a variable `logDirectory` that stores
the path to a directory named 'log' relative to the current directory (`__dirname`). The
`path.join()` method is used to construct the full path by joining the current directory path with
the 'log' directory name. This code is ensuring that a log directory is created if it does not
already exist in the current directory. */
const logDirectory = path.join(__dirname, 'log')


// ensure log directory exists
/* The code `fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);` is checking if the log
directory specified by `logDirectory` exists. If the directory does not exist, it creates the
directory using `fs.mkdirSync(logDirectory)`. */
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

module.exports = { dbCredentials, accessLogStream };