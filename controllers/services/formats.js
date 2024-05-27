const { DataTypes } = require("sequelize");

class outputFormats {
  /**
   * The function `errorOutput` returns an object with a status code, message, and null results.
   * @param [message] - The `message` parameter in the `errorOutput` function is expected to be a
   * string that represents the error message or description.
   * @param [code] - The `code` parameter in the `errorOutput` function is expected to be an integer
   * value representing the status code of the error.
   * @returns An object is being returned with the properties `status`, `message`, and `results`. The
   * `status` property is set to the value of the `code` parameter, the `message` property is set to
   * the value of the `message` parameter, and the `results` property is set to `null`.
   */
  static errorOutput(message = DataTypes.STRING, code = DataTypes.INTEGER) {
    return {
      status: code,
      message: message,
      results: null,
    };
  }

  /**
   * The function `okOutput` returns an object with a status code, message, and results.
   * @param [message] - The `message` parameter is a string that represents a message or description
   * related to the output.
   * @param [code] - The `code` parameter in the `okOutput` function represents the status code that
   * will be returned in the output object. It is of type `DataTypes.INTEGER`.
   * @param outputResults - outputResults is a parameter that represents the results or data that will
   * be included in the output object returned by the okOutput function. It can be any type of data,
   * such as an array, object, string, number, etc., depending on the specific use case of the
   * function.
   * @returns An object is being returned with three properties: status, message, and results.
   */
  static okOutput(message = DataTypes.STRING, code = DataTypes.INTEGER, outputResults) {
    return {
      status: code,
      message: message,
      results: outputResults,
    };
  }
}

module.exports = { outputFormats };
