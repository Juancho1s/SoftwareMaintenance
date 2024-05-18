var express = require("express");
var router = express.Router();

const { ElevatorController } = require("../controllers/ElevatorController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    Hi: "Elevator manage system",
  });
});

router.get("/elevators", ElevatorController.getAllData);

module.exports = router;
