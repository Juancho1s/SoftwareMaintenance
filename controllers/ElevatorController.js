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

  static async 
}

module.exports = { ElevatorController };
