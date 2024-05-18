var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    "Hi": "Elevator manage system",
  });
});

module.exports = router;
