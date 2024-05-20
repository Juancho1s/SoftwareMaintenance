const { elevatorORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");
const { Direction_listController } = require("./Direction_listController");
const { DataTypes } = require("sequelize");

class ElevatorController {
  static async getAllData() {
    try {
      var results = await elevatorORM.findAll();

      if (results) {
        return outputFormats.okOutput(
          "All data found successfully!",
          200,
          results
        );
      } else {
        return outputFormats.errorOutput("No data found", 404);
      }
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async getByID(id) {
    try {
      var results = await elevatorORM.findByPk(id);

      if (results) {
        return outputFormats.okOutput("Data found successfully!", 200, results);
      } else {
        return outputFormats.errorOutput("No data found", 404);
      }
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async modifyState(data, id) {
    /*
    state 0: stand
    state 1: up
    state 2: down
    state 3: maintenance
    */

    if (!("state" in data)) {
      return outputFormats.errorOutput(
        `Bad request: you are missing the 'state' key in your json request`,
        400
      );
      return;
    } else if (isNaN(id)) {
      return outputFormats.errorOutput(
        `Bad request: the parameter on the 'id' must be integer.`,
        400
      );
    }

    var state = data["state"];
    if ((state > 3) | (state < 0) | isNaN(state)) {
      return outputFormats.errorOutput(
        `Bad request: the 'state' key must be between 0 and 3`,
        400
      );
    }

    var updateFields = {};
    switch (state) {
      case 0:
        updateFields = {
          state: 0,
          signal: 0,
        };
        break;

      case 1:
        updateFields = {
          state: 1,
          signal: 1,
        };
        break;

      case 2:
        updateFields = {
          state: 2,
          signal: 1,
        };
        break;

      case 3:
        updateFields = {
          state: 3,
          signal: 2,
        };
        break;

      default:
        return outputFormats.errorOutput(
          `Bad request: no case found for the current state`,
          400
        );
    }

    updateFields["last_change"] = Date.now();

    try {
      var results = await elevatorORM.update(updateFields, {
        where: { id: id },
      });

      if (results) {
        return outputFormats.okOutput(
          "Data modified successfully!",
          200,
          results
        );
      } else {
        return outputFormats.errorOutput("No data modified", 404);
      }
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async changeFloor(id, nextFloor) {
    var elevators = await this.getAllData();

    if (elevators["status"] != 200) {
      return elevators;
    }

    elevators.forEach(item => {
      
    });

    try {
      var results = await elevatorORM.update(
        {
          floor: req.body.floor,
          last_change: Date.now(),
        },
        {
          where: { id: req.params.id },
        }
      );
      if (results) {
        return outputFormats.okOutput(
          "Data modified successfully!",
          200,
          results
        );
      } else {
        return outputFormats.errorOutput("No data modified", 404);
      }
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async assignDirection(newFloorStop) {
    var elevatorsData = await this.getAllData();

    if (elevatorsData["status"] != 200) {
      return data;
    }

    var responses = [];
    var elevatorsObject = {
      id: [],
      currentFloor: [],
      state: [],
      signal: [],
    };
    var newDirection = {
      direction_floor_number: newFloorStop,
      elevator_direction_id: null,
    };
    var elevatorAux = {
      id: null,
      state: null,
      direction: null,
    };
    var proximity = null;

    elevatorsData["results"].forEach((item) => {
      elevatorsObject.id.push(item.id);
      elevatorsObject.currentFloor.push(item.current_floor);
      elevatorsObject.state.push(item.state);
      elevatorsObject.signal.push(item.signal);
    });

    for (let i = 0; i < elevatorsObject["id"].length; i++) {
      if (elevatorsObject["currentFloor"][i] == newFloorStop) {
        if (elevatorsObject["state"][i] != 0) {
          responses.push(
            await this.modifyState({ state: 0 }, elevatorsData["id"][i])
          );
        }
        return responses;
      }

      if (
        (elevatorsObject["currentFloor"][i] < newFloorStop) &
        [0, 1].includes(elevatorsObject["state"][i])
      ) {
        var up = newFloorStop - elevatorsObject["currentFloor"][i];

        if ((proximity == null) | (up < proximity)) {
          proximity = up;
          elevatorAux.id = elevatorsObject["id"][i];
          elevatorAux.state = elevatorsObject["state"][i];
          elevatorAux.direction = 1;
        }
      } else if (
        (elevatorsObject["currentFloor"][i] > newFloorStop) &
        [0, 2].includes(elevatorsObject["state"][i])
      ) {
        var down = elevatorsObject["currentFloor"][i] - newFloorStop;

        if ((proximity == null) | (down < proximity)) {
          proximity = down;
          elevatorAux.id = elevatorsObject["id"][i];
          elevatorAux.state = elevatorsObject["state"][i];
          elevatorAux.direction = 2;
        }
      }
    }

    if (elevatorAux.id == null) {
      responses.push(
        outputFormats.errorOutput(
          "Conflict, there isn't any available elevator",
          409
        )
      );

      return responses;
    }

    if (elevatorAux["state"] == 0) {
      responses.push(
        await this.modifyState({ state: elevatorAux.direction }, elevatorAux.id)
      );
    }

    newDirection.elevator_direction_id = elevatorAux.id;

    responses.push(
      await Direction_listController.createDirection(
        newDirection.direction_floor_number,
        newDirection.elevator_direction_id
      )
    );

    return outputFormats.okOutput(
      "The new floor stop was already processed",
      200,
      responses
    );
  }
}

module.exports = { ElevatorController };
