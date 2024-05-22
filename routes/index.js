var express = require("express");
var router = express.Router();

const { ElevatorController } = require("../controllers/ElevatorController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    Hi: "Elevator manage system",
  });
});

/* Gets */
router.get("/elevators", async function (req, res, next) {
  res.json(await ElevatorController.getAllData());
});
router.get("/elevators/:id", async function (req, res, next) {
  res.json(await ElevatorController.getByID(req.params.id));
});

/* Puts */
router.put("/elevators/:direction", async function (req, res, next) {
  res.json(await ElevatorController.modifyState(req.body, req.params.id));
});
router.put("/directions/update", async function(req, res, next){
  res.json(await ElevatorController.changeFloor());
});

/* Posts */
router.post("/directions/:floor/:elevator_id", async function(req, res, next){
  res.json(await ElevatorController.assignElevatorDirection(req.params.floor, req.params.elevator_id));
});

module.exports = router;
