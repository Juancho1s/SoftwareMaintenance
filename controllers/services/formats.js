const { DataTypes } = require("sequelize");

class outputFormats {
  static errorOutput(message = DataTypes.STRING, code = DataTypes.INTEGER) {
    return {
      status: code,
      message: message,
      results: null,
    };
  }

  static okOutput(message = DataTypes.STRING, code = DataTypes.INTEGER, outputResults) {
    return {
      status: code,
      message: message,
      results: outputResults,
    };
  }
}

module.exports = { outputFormats };
