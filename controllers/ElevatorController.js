const { elevatorORM, direction_listORM } = require("../models/ElevatorORM");
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

  static async requestElevator(direction, fromFloor) {
    let elevators = await this.getAllData();

    if (elevators.status != 200) {
      return outputFormats.errorOutput("There is no processable data", 500);
    }

    let results = null;

    for (let i = 0; i < elevators.results.length; i++) {
      const currentElevator = elevators.results[i].dataValues;

      let response = await this.assignElevatorDirection(
        direction,
        currentElevator.id
      );
        switch (currentElevator.state) {
          case 0:
            let directionList = await Direction_listController.getDataByForeign(
              currentElevator.id,
              "DESC"
            );

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
              results = await elevatorORM.update(
                { state: 0, current_floor: fromFloor, signal: 0 },
                { where: { id: currentElevator.id } }
              );
            } else if(
              direction_floor_number.direction_floor_number <
              currentElevator.current_floor
            ) {
              await Direction_listController.deleteRangeById(
                currentElevator.id,
                fromFloor,
                "DESC"
              );
              results = await elevatorORM.update(
                { state: 0, current_floor: fromFloor, signal: 0 },
                { where: { id: currentElevator.id } }
              );
            }else {
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
      await Direction_listController.deleteRangeById(currentElevator.id, direction);
    }

    return outputFormats.errorOutput(
      "There is no elevator available for the current direction",
      400
    );
  }
}

module.exports = { ElevatorController };
