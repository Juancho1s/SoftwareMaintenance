const { direction_listORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");

class Direction_listController {
  static async createDirection(newDirection) {
    try {
      const results = await direction_listORM.create(newDirection);
      if (results) {
        return outputFormats.okOutput(
          "The new direction has been successfully created.",
          200,
          results
        );
      }

      return outputFormats.errorOutput(`No data modified`, 400);
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async deleteDirection(floor) {
    if (isNaN(floor)) {
        return outputFormats.errorOutput(`The 'floor' parameter must be a number`, 400);
    }
    try {
      const results = await direction_listORM.destroy({
        where: { direction_floor_number: floor },
      });
      if (results) {
        return outputFormats.okOutput(
          "The direction has been successfully deleted.",
          200,
          results
        );
      }

      return outputFormats.errorOutput(`No data found to delete`, 404);

    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async getAllData() {
    try {
      const allDirections = await direction_listORM.findAll();
      if (allDirections) {
        return outputFormats.okOutput(
          "All directions have been successfully retrieved.",
          200,
          allDirections
        );
      }

      return outputFormats.errorOutput("No data retrieved", 400);
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }
}

module.exports = { Direction_listController };
