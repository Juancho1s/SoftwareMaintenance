const { elevatorORM, direction_listORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");
const { Direction_listController } = require("./Direction_listController");
const { DataTypes } = require("sequelize");

class ElevatorController {
  /**
   * This function asynchronously retrieves all data using an ORM, handles different outcomes, and
   * returns appropriate output.
   * @returns The `getAllData` function is returning different outputs based on the results of the
   * `elevatorORM.findAll()` operation:
   */
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


  /**
   * The function getByID asynchronously retrieves data by ID using elevatorORM and returns appropriate
   * output based on the results.
   * @param id - The `id` parameter is the unique identifier used to search for a specific record in
   * the database. In the provided code snippet, the `getByID` method is an asynchronous function that
   * retrieves data from the database using the `id` parameter.
   * @returns The `getByID` function is returning different outputs based on the results of the
   * database query:
   */
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


  /**
   * The function `modifyState` updates the state of an elevator in a database based on the provided
   * data and elevator ID.
   * @param data - The `data` parameter in the `modifyState` function is expected to be an object
   * containing the following key-value pairs: state
   * @param id - The `id` parameter in the `modifyState` function is used to identify the specific
   * elevator that needs to be modified. It is expected to be an integer value representing the unique
   * identifier of the elevator in the database. This `id` is used to locate the elevator record that
   * needs to be updated
   * @returns The `modifyState` function returns different outputs based on the conditions met during
   * its execution.
   */
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


  /**
   * The function `modifyFloor` updates the current floor and last change timestamp of an elevator in a
   * database using async/await and error handling.
   * @param nextFloor - Next floor to which the elevator will be modified.
   * @param id - The `id` parameter in the `modifyFloor` function is used to specify the unique
   * identifier of the elevator that you want to modify the current floor for. This identifier is
   * typically used to locate the specific elevator record in the database and update its current floor
   * information.
   * @returns The `modifyFloor` function returns different outputs based on the outcome of the
   * operation:
   */
  static async modifyFloor(nextFloor, id) {
    const updateFields = {
      current_floor: nextFloor,
      last_change: Date.now(),
    };
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
        return outputFormats.errorOutput("No data found to modifie", 404);
      }
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }


  /**
   * The function `changeFloor` asynchronously updates elevator floors based on their current state and
   * direction.
   * @returns The function `changeFloor` returns an array `results` containing the results of the
   * elevator floor change operations and other related actions.
   */
  static async changeFloor() {
    var results = [];
    var elevators = await this.getAllData();

    if (elevators["status"] != 200) {
      results.push(elevators);
      return results;
    }

    for (let i = 0; i < elevators.results.length; i++) {
      var data = elevators.results[i].dataValues;

      var mod = null;

      switch (data.state) {
        case 0:
          var stops = await Direction_listController.getDataByForeign(
            data.id,
            "ASC"
          );

          if (stops.status == 200) {
            let values = stops.results[0];
            mod = await elevatorORM.update(
              { current_floor: values.direction_floor_number },
              { where: { id: data.id } }
            );
            results.push(mod);

            mod = await Direction_listController.deleteDirection(
              values.direction_floor_number,
              data.id
            );
            results.push(mod);
          }
          break;

        case 1:
          var stops = await Direction_listController.getDataByForeign(
            data.id,
            "ASC"
          );

          if (stops.status != 200) {
            results.push(stops);
            break;
          }

          var queryData = stops.results[0];
          var direction = queryData.dataValues.direction_floor_number;

          if (data.current_floor + 1 == direction) {
            mod = await this.modifyFloor(data.current_floor + 1, data.id);

            if (mod.status != 200) {
              break;
            }
            results.push(mod);

            mod = await Direction_listController.deleteDirection(
              direction,
              data.id
            );

            if (mod.status != 200) {
              break;
            }
            results.push(mod);

            results.push(await this.modifyState({ state: 0 }, data.id));
          } else {
            results.push(
              await this.modifyFloor(data.current_floor + 1, data.id)
            );
          }
          break;

        case 2:
          var stops = await Direction_listController.getDataByForeign(
            data.id,
            "DESC"
          );

          if (stops.status != 200) {
            results.push(stops);
            break;
          }

          var queryData = stops.results[0];
          var direction = queryData.dataValues.direction_floor_number;

          if (data.current_floor - 1 == direction) {
            mod = await this.modifyFloor(data.current_floor - 1, data.id);

            if (mod.status != 200) {
              break;
            }
            results.push(mod);

            mod = await Direction_listController.deleteDirection(
              direction,
              data.id
            );

            if (mod.status != 200) {
              break;
            }
            results.push(mod);

            results.push(await this.modifyState({ state: 0 }, data.id));
          } else {
            results.push(
              await this.modifyFloor(data.current_floor - 1, data.id)
            );
          }
          break;

        default:
          break;
      }
    }
    return results;
  }


  /**
   * The function `assignElevatorDirection` determines the direction for an elevator based on the
   * current state and new floor stop requested.
   * @param newFloorStop - The `newFloorStop` parameter represents the floor number where the elevator
   * needs to stop or move towards. The function `assignElevatorDirection` is responsible for assigning
   * the direction for the elevator based on the new floor stop provided. The function checks the
   * current state of the elevator and determines whether the new stop will be.
   * @param elevatorId - The `elevatorId` parameter is used to identify a specific elevator for which
   * you want to assign a new floor stop direction.
   * @returns The function `assignElevatorDirection` returns either an array of responses if a new
   * direction is set for the elevator, or an error message indicating that the floor requested is not
   * yet available for the current elevator.
   */
  static async assignElevatorDirection(newFloorStop, elevatorId) {
    let elevatorQuery = await this.getByID(elevatorId);
    let responses = [];

    if (elevatorQuery.status != 200) {
      return outputFormats.errorOutput("There is no processable data", 500);
    }
    let elevatorData = elevatorQuery.results.dataValues;

    switch (elevatorData.state) {
      case 0:
        let nextStops = await Direction_listController.getDataByForeign(
          elevatorId,
          "ASC"
        );

        if (nextStops.results == null) {
          responses.push(
            await Direction_listController.createDirection(
              newFloorStop,
              elevatorId
            )
          );

          return responses;
        }

        let nextStop = nextStops.results[0].dataValues;

        if (elevatorData.current_floor < nextStop.direction_floor_number) {
          if (newFloorStop > elevatorData.current_floor) {
            responses.push(
              await Direction_listController.createDirection(
                newFloorStop,
                elevatorId
              )
            );
          }
        } else {
          if (newFloorStop < elevatorData.current_floor) {
            responses.push(
              await Direction_listController.createDirection(
                newFloorStop,
                elevatorId
              )
            );
            return outputFormats.okOutput(
              "The new destination has been already set",
              200,
              responses
            );
          }
        }
        break;

      case 1:
        if (newFloorStop > elevatorData.current_floor) {
          responses.push(
            await Direction_listController.createDirection(
              newFloorStop,
              elevatorId
            )
          );
          return outputFormats.okOutput(
            "The new destination has been already set",
            200,
            responses
          );
        }
        break;

      case 2:
        if (newFloorStop < elevatorData.current_floor) {
          responses.push(
            await Direction_listController.createDirection(
              newFloorStop,
              elevatorId
            )
          );
          return outputFormats.okOutput(
            "The new destination has been already set",
            200,
            responses
          );
        }
        break;

      default:
        return outputFormats.errorOutput("There is no processable data", 500);
        break;
    }
    return outputFormats.errorOutput(
      "The floor requeste is not yet available for the current elevator",
      409
    );
  }

  
  /**
   * The function `requestElevator` in JavaScript asynchronously assigns an elevator based on direction
   * and floor input.
   * @param direction - The `direction` parameter in the `requestElevator` function represents the
   * direction in which the elevator is requested to move. It could be either "up" or "down" indicating
   * the desired direction of travel for the elevator.
   * @param fromFloor - The `fromFloor` parameter in the `requestElevator` function represents the
   * floor from which the elevator request is made. This parameter specifies the current floor where
   * the user is located and needs the elevator to arrive. The function uses this information to
   * determine the most suitable elevator to assign based on the direction
   * @returns The function `requestElevator` returns either an "Elevator assigned" message with a
   * status code of 200 and the updated elevator data if an elevator is successfully assigned, or an
   * error message stating "There is no elevator available for the current direction" with a status
   * code of 400 if no elevator is available for the specified direction.
   */
  static async requestElevator(direction, fromFloor) {
    let elevators = await this.getAllData();

    if (elevators.status != 200) {
      return outputFormats.errorOutput("There is no processable data", 500);
    }

    let results = null;

    for (let i = 0; i < elevators.results.length; i++) {
      const currentElevator = elevators.results[i].dataValues;



      switch (currentElevator.state) {
        case 0:
          let directionList =
            await Direction_listController.getDataByForeign(
              currentElevator.id,
              "DESC",
              direction
            );

          if (directionList.results == null) {
            Direction_listController.createDirection(direction, currentElevator.id);
            return await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          }

          let direction_floor_number = directionList.results[0];

          if (
            direction_floor_number.direction_floor_number >
            currentElevator.current_floor
          ) {
            await Direction_listController.deleteRangeById(
              currentElevator.id,
              fromFloor,
              "ASC"
            );
            
            Direction_listController.createDirection(direction, currentElevator.id);
            results = await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          } else if (
            direction_floor_number.direction_floor_number <
            currentElevator.current_floor
          ) {
            await Direction_listController.deleteRangeById(
              currentElevator.id,
              fromFloor,
              "DESC"
            );
            
            Direction_listController.createDirection(direction, currentElevator.id);
            results = await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          } else {
            
            Direction_listController.createDirection(direction, currentElevator.id);
            results = await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          }

          break;

        case 1:
          if (currentElevator.current_floor <= fromFloor) {
            await Direction_listController.deleteRangeById(
              currentElevator.id,
              fromFloor,
              "ASC"
            );

            results = await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          }

          break;

        case 2:
          if (currentElevator.current_floor >= fromFloor) {
            await Direction_listController.deleteRangeById(
              currentElevator.id,
              fromFloor,
              "DESC"
            );

            results = await elevatorORM.update(
              { state: 0, current_floor: fromFloor, signal: 0 },
              { where: { id: currentElevator.id } }
            );
          }

          break;
      }

      if (results != null) {
        return outputFormats.okOutput("Elevator assigned", 200, results);
      }

      await Direction_listController.deleteDirection(
        direction,
        currentElevator.id
      );
    }

    return outputFormats.errorOutput(
      "There is no elevator available for the current direction",
      400
    );
  }
}

module.exports = { ElevatorController };
