const { direction_listORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");
const { Op } = require("sequelize");

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

  static async deleteDirection(floor, elevatorId) {
    if (isNaN(floor)) {
      return outputFormats.errorOutput(
        `The 'floor' parameter must be a number`,
        400
      );
    }
    try {
      const results = await direction_listORM.destroy({
        where: {
          direction_floor_number: floor,
          elevator_direction_id: elevatorId,
        },
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

  static async deleteRangeById(elevator_direction_id, floorNumber, order) {
    try {
      if (order == "ASC") {
        const results = await direction_listORM.destroy({
          where: {
            elevator_direction_id: elevator_direction_id,
            direction_floor_number: {
              [Op.lte]: floorNumber,
            },
          },
        });
      } else if (order == "DESC") {
        const results = await direction_listORM.destroy({
          where: {
            elevator_direction_id: elevator_direction_id,
            direction_floor_number: {
              [Op.gte]: floorNumber,
            },
          },
        });
      } else {
        return outputFormats.errorOutput(
          `The 'order' parameter must be either 'ASC' or 'DESC'`,
          400
        );
      }
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

  static async getDataByForeign(elevatorId, order) {
    try {
      const allDirections = await direction_listORM.findAll({
        attributes: ["id", "direction_floor_number", "elevator_direction_id"], // Specify the columns to select
        where: { elevator_direction_id: elevatorId },
        order: [["direction_floor_number", order]],
      });
      if (allDirections.length > 0) {
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

  static async getDataByForeignUnlike(elevatorId, order, finder){
    try {
      const allDirections = await direction_listORM.findAll({
        attributes: ["id", "direction_floor_number", "elevator_direction_id"], // Specify the columns to select
        where: { elevator_direction_id: elevatorId,
          direction_floor_number: {[Op.ne]: finder}
         },
        order: [["direction_floor_number", order]],
      });
      if (allDirections.length > 0) {
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
