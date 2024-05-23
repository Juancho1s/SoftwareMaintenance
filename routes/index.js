var express = require("express");
var router = express.Router();

const { ElevatorController } = require("../controllers/ElevatorController");
const {
  Direction_listController,
} = require("../controllers/Direction_listController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    Hi: "Elevator manage system",
  });
});

/* Gets */
router.get("/elevators", async function (req, res, next) {
  let elevatorsData = await ElevatorController.getAllData();
  let responsing = {
    status: elevatorsData.status,
    message: elevatorsData.message,
    results: [],
  };

  for (let i = 0; i < elevatorsData.results.length; i++) {
    const elevator = elevatorsData.results[i];

    switch (elevator.state) {
      case 1:
        responsing.results.push({
          current_floor: elevatorsData.results[i].current_floor,
          id: elevatorsData.results[i].id,
          last_change: elevatorsData.results[i].last_change,
          signal: elevatorsData.results[i].signal,
          state: elevatorsData.results[i].state,
          direction: (
            await Direction_listController.getDataByForeign(elevator.id, "ASC")
          ).results,
        });
        break;

      case 2:
        responsing.results.push({
          current_floor: elevatorsData.results[i].current_floor,
          id: elevatorsData.results[i].id,
          last_change: elevatorsData.results[i].last_change,
          signal: elevatorsData.results[i].signal,
          state: elevatorsData.results[i].state,
          direction: (
            await Direction_listController.getDataByForeign(elevator.id, "DESC")
          ).results,
        });
        break;

      default:
        responsing.results.push({
          current_floor: elevatorsData.results[i].current_floor,
          id: elevatorsData.results[i].id,
          last_change: elevatorsData.results[i].last_change,
          signal: elevatorsData.results[i].signal,
          state: elevatorsData.results[i].state,
          direction: (
            await Direction_listController.getDataByForeign(elevator.id, "ASC")
          ).results,
        });
        break;
    }
  }
  res.json(responsing);
});
router.get("/elevators/:id", async function (req, res, next) {
  res.json(await ElevatorController.getByID(req.params.id));
});

/* Puts */
router.put("/elevators/:direction", async function (req, res, next) {
  res.json(await ElevatorController.modifyState(req.body, req.params.id));
});
router.put("/directions/update", async function (req, res, next) {
  res.json(await ElevatorController.changeFloor());
});

/* Posts */
router.post(
  "/directions/assignation/:floor/:elevator_id",
  async function (req, res, next) {
    res.json(
      await ElevatorController.assignElevatorDirection(
        req.params.floor,
        req.params.elevator_id
      )
    );
  }
);

router.post(
  "/direction/request/:direction/:from_floor",
  async function (req, res, next) {
    res.json(
      await ElevatorController.requestElevator(
        req.params.direction,
        req.params.from_floor
      )
    );
  }
);

module.exports = router;
