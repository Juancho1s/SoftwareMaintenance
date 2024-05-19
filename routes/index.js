var express = require("express");
var router = express.Router();

const { ElevatorController } = require("../controllers/ElevatorController");
const { elevatorORM } = require("../models/ElevatorORM.JS");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    Hi: "Elevator manage system",
  });
});

/* Get */
router.get("/elevators", ElevatorController.getAllData);
router.get("/elevators/:id", ElevatorController.getByID);

/* Put */
router.put("/elevators/:id", ElevatorController.modifyState);


module.exports = router;
