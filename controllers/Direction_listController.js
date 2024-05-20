const { direction_listORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");

class Direction_listController {
  static async createDirection(direction_floor_number, elevator_direction_id) {
    try {
      const results = await direction_listORM.create({
        direction_floor_number: direction_floor_number,
        elevator_direction_id: elevator_direction_id,
      });
      if (results) {
        return outputFormats.okOutput(
          "The new direction has been successfully created.",
          200,
          results
        );
      }

      return outputFormats.errorOutput(
        "Conflict, there is already written the number you have introduced",
        409
      );
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async deleteDirection(floor) {
    if (isNaN(floor)) {
      return outputFormats.errorOutput(
        `The 'floor' parameter must be a number`,
        400
      );
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

      return outputFormats.errorOutput("No data retrieved", 404);
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }

  static async getDataByForeign(elevatorId) {
    try {
      const allDirections = await direction_listORM.findAll({
        where: { direction_elevator_id: elevatorId },
      });
      if (allDirections) {
        return outputFormats.okOutput(
          "All directions have been successfully retrieved.",
          200,
          allDirections
        );
      }

      return outputFormats.errorOutput("No data retrieved", 404);
    } catch (error) {
      return outputFormats.errorOutput(`Internal server error: ${error}`, 500);
    }
  }
}

module.exports = { Direction_listController };
