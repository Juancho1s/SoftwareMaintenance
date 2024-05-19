const { elevatorORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");
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
        `Bad request: the parameter on the URL '/elevators/<<id>>' must be integer.`,
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

  static async changeFloor(
    id = DataTypes.INTEGER,
    nextFloor = DataTypes.INTEGER
  ) {
    var currntStage = await this.getByID(id);

    if (currntStage["status"] != 200) {
      return currntStage;
    }

    switch (currntStage[0].dataValues) {
      case 0:
        break;

      case 1:
        break;

      case 2:
        break;

      case 3:
        break;

      default:
        break;
    }

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
}

module.exports = { ElevatorController };
