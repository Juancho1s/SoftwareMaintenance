const { isColString } = require("sequelize/lib/utils");
const {
  elevatorORM,
  direction_listORM,
  carry_listORM,
} = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");

class ElevatorController {
  static async getAllData(req, res, next) {
    try {
      var results = await elevatorORM.findAll();

      if (results) {
        res.json(
          outputFormats.okOutput("All data found successfully!", 200, results)
        );
      } else {
        res.json(outputFormats.errorOutput("No data found", 404));
      }
    } catch (error) {
      res.json(
        outputFormats.errorOutput(`Internal server error: ${error}`, 500)
      );
    }
  }

  static async getByID(req, res, next) {
    try {
      var results = await elevatorORM.findByPk(req.params.id);

      if (results) {
        res.json(
          outputFormats.okOutput("Data found successfully!", 200, results)
        );
      } else {
        res.json(outputFormats.errorOutput("No data found", 404));
      }
    } catch (error) {
      res.json(
        outputFormats.errorOutput(`Internal server error: ${error}`, 500)
      );
    }
  }

  static async modifyState(req, res, next) {
    /*
    state 0: stand
    state 1: up
    state 2: down
    state 3: maintenance
    */

    var data = req.body;

    if (!("state" in data)) {
      res.json(
        outputFormats.errorOutput(
          `Bad request: you are missing the 'state' key in your json request`,
          400
        )
      );
    }

    var state = data["state"];
    if ((state > 3) | (state < 0) | isNaN(state)) {
      res.json(
        outputFormats.errorOutput(
          `Bad request: the 'state' key must be between 0 and 3`,
          400
        )
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
        res.json(
          outputFormats.errorOutput(
            `Bad request: no case found for the current state`,
            400
          )
        );
    }

    updateFields["last_change"] = Date.now();

    try {
      var results = await elevatorORM.update(updateFields, {
        where: { id: req.params.id },
      });

      if (results) {
        res.json(
          outputFormats.okOutput("Data modified successfully!", 200, results)
        );
      } else {
        res.json(outputFormats.errorOutput("No data modified", 404));
      }
    } catch (error) {
      res.json(
        outputFormats.errorOutput(`Internal server error: ${error}`, 500)
      );
    }
  }
}

module.exports = { ElevatorController };
