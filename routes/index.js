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

/* This specific route `router.get("/elevators", async function (req, res, next) { ... }` is handling a
GET request to retrieve data about all elevators. Here's a breakdown of what it does:
- `router.get("/elevators", ...)` specifies the route and the HTTP method (GET
  in this case).
  - `async function (req, res, next) { ... }` is the callback function that
  handles the request. It's marked as `async` because it uses `await` to wait
  for the promise returned by `ElevatorController.getAllElevators()` to resolve.
  - `ElevatorController.getAllElevators()` is a function that retrieves data
  about all elevators from the database. It returns a promise that resolves with
  an array of elevator objects.
  - `res.json(elevators)` sends the response back to the client as JSON data.
  The `res.json()` method automatically sets the `Content-Type` header to
  `application/json`, so the client knows to expect JSON data.
  - `next` is a function that's used to pass control to the next middleware
  function in the stack. In this case, it's not used because the response is
  being sent directly from this callback function. 
*/
router.get("/elevators", async function (req, res, next) {
  let elevatorsData = await ElevatorController.getAllData();
  let responsing = {
    status: elevatorsData.status,
    message: elevatorsData.message,
    results: [],
  };

  for (let i = 0; i < elevatorsData.results.length; i++) {
    const elevator = elevatorsData.results[i];
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
  }
  res.json(responsing);
});


/* This specific route `router.get("/elevators/:id", async function (req, res, next) {
  res.json(await ElevatorController.getByID(req.params.id));
});` is handling a GET request to retrieve data about a specific elevator based on the provided `id`
parameter. */
router.get("/elevators/:id", async function (req, res, next) {
  res.json(await ElevatorController.getByID(req.params.id));
});

/* Puts */

/* This specific route is handling a PUT request to modify the state of an elevator based on the
provided direction parameter. Here's a breakdown of what it does: */
router.put("/elevators/:direction", async function (req, res, next) {
  res.json(await ElevatorController.modifyState(req.body, req.params.id));
});

/* This specific route `router.put("/directions/update", async function (req, res, next) {
  res.json(await ElevatorController.changeFloor());
});` is handling a PUT request to update the direction of the elevator. It calls the `changeFloor()`
method from the `ElevatorController` to perform the necessary logic to change the floor of the
elevator. The response will be a JSON object containing the result of the operation. */
router.put("/directions/update", async function (req, res, next) {
  res.json(await ElevatorController.changeFloor());
});

/* Posts */

/* This specific route is handling a POST request to assign a direction to a specific elevator based on
the provided parameters `floor` and `elevator_id`. When this route is accessed, it calls the
`assignElevatorDirection` method from the `ElevatorController` and passes the `floor` and
`elevator_id` parameters to it. The response will be a JSON object containing the result of the
assignment operation. */
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

/* This specific route is handling a POST request to request an elevator to a specific floor from a
certain direction. */
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
