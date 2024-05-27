const { direction_listORM } = require("../models/ElevatorORM");
const { outputFormats } = require("./services/formats");
const { Op } = require("sequelize");

class Direction_listController {
  /**
   * The function creates a new direction entry in a database table and returns a success message or an
   * error message based on the outcome.
   * @param direction_floor_number - The `direction_floor_number` parameter represents the floor number
   * for which the direction is being created. This could be the floor number in a building where an
   * elevator is moving, for example.
   * @param elevator_direction_id - The `elevator_direction_id` parameter likely represents the unique
   * identifier or ID associated with a specific elevator direction. This ID could be used to identify
   * and differentiate between different elevator directions within a system or database. When creating
   * a new direction
   * @returns The `createDirection` function returns either a success message with the newly created
   * direction details if the creation is successful, or an error message indicating a conflict if the
   * direction floor number already exists, or an internal server error message if an error occurs
   * during the process.
   */
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

  /**
   * The function `deleteDirection` deletes a direction entry based on the floor number and elevator ID
   * provided.
   * @param floor - The `floor` parameter represents the floor number for which you want to delete a
   * direction entry in the database. It should be a number indicating the specific floor for which the
   * direction entry needs to be deleted.
   * @param elevatorId - The `elevatorId` parameter represents the unique identifier of the elevator
   * for which you want to delete a direction entry. It is used to specify which elevator's direction
   * entry should be deleted from the database.
   * @returns The `deleteDirection` function returns different outputs based on the conditions:
   */
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

  /**
   * The function `deleteRangeById` deletes records based on a specified floor number and order for a
   * given elevator direction ID.
   * @param elevator_direction_id - The `elevator_direction_id` parameter is used to specify the ID of
   * the elevator direction for which you want to delete a range of records. It is used to identify the
   * specific elevator direction in the database table.
   * @param floorNumber - The `floorNumber` parameter represents the floor number used as a reference
   * point for deleting records in the database. Depending on the `order` parameter value ("ASC" or
   * "DESC"), records with a `direction_floor_number` that is less than or equal to (`[Op.lte]`) or
   * @param order - The `order` parameter in the `deleteRangeById` function specifies the order in
   * which the deletion operation should be performed. It can have two possible values: "ASC" or
   * "DESC".
   * @returns The `deleteRangeById` function returns either the results of deleting records from the
   * `direction_listORM` table based on the specified conditions, an error message if there is an issue
   * with the input parameters, or an error message for internal server errors.
   */
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

  /**
   * The function `getAllData` retrieves all directions data and returns an output based on the result.
   * @returns The `getAllData` function is returning an output object based on the result of the
   * database query. If the query is successful and data is retrieved, it returns an "okOutput" object
   * with a success message, HTTP status code 200, and the retrieved data. If no data is retrieved, it
   * returns an "errorOutput" object with a message indicating no data was retrieved and HTTP status
   * code
   */
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

  /**
   * The function `getDataByForeign` retrieves all directions associated with a specific elevator ID
   * and orders them based on floor number.
   * @param elevatorId - The `elevatorId` parameter is used to filter the data based on the
   * `elevator_direction_id` in the `direction_listORM` table. The function retrieves all directions
   * that match the specified `elevatorId`.
   * @param order - The `order` parameter in the `getDataByForeign` function is used to specify the
   * order in which the results should be sorted. It is used in the `order` property of the `findAll`
   * method to determine the sorting order of the retrieved data based on the `direction_floor_number`
   * column
   * @returns The `getDataByForeign` function is returning a response based on the data retrieved from
   * the database query. If directions are found for the specified `elevatorId`, it returns a success
   * response with the directions data. If no directions are found, it returns an error response
   * indicating that no data was retrieved. In case of any internal server error during the database
   * query, it returns an error response with the spesified server error.
   */
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

  /**
   * The function `getDataByForeignUnlike` retrieves direction data based on specified criteria and
   * returns a success message with the data if found, or an error message if no data is retrieved.
   * @param elevatorId - The `elevatorId` parameter is used to filter the data based on the
   * `elevator_direction_id` column in the database table. The function retrieves all directions where
   * the `elevator_direction_id` matches the provided `elevatorId`.
   * @param order - The `order` parameter in the `getDataByForeignUnlike` function is used to specify
   * the order in which the results should be sorted. It determines whether the results should be
   * sorted in ascending or descending order based on the specified column.
   * @param finder - The `finder` parameter in the `getDataByForeignUnlike` function is used as a
   * filter condition in the database query. It is used to find records where the
   * `direction_floor_number` is not equal to the value of `finder`. This helps in retrieving data
   * based on a specific condition where the it is needed to avoid an specific value
   * @returns The `getDataByForeignUnlike` function returns a response based on the data retrieved from
   * the database query. If directions matching the specified criteria are found, it returns a success
   * response with status code 200 and the retrieved directions data. If no data is retrieved, it
   * returns an error response with status code 404. In case of any internal server error during the
   * database query execution, it returns an error
   */
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
