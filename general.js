const path = require('path');
const fs = require("fs");
const morgan = require('morgan');



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

const logDirectory = path.join(__dirname, 'log')
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

module.exports = { dbCredentials, accessLogStream };