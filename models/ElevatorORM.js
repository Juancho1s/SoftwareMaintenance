const { Sequelize, DataTypes } = require("sequelize");
const { dbCredentials } = require("../general");

const sequelize = new Sequelize(dbCredentials);

const elevatorORM = sequelize.define('elevator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  current_floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  state: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  signal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  last_change: {
    type: DataTypes.DATE,
  }
});

const direction_listORM = sequelize.define('direction_list', {
  direction_floor_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  elevator_direction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: elevatorORM, // This references the table name directly
      key: "id",
    },
  },
});

const carry_listORM = sequelize.define('carry_list', {
  stop_floor_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  elevatro_stop_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: elevatorORM, // This references the table name directly
      key: "id",
    },
  },
});

// Set up associations
elevatorORM.hasMany(direction_listORM);

elevatorORM.hasMany(carry_listORM);

direction_listORM.belongsTo(elevatorORM, {
  foreignKey: "elevator_direction_id",
});

carry_listORM.belongsTo(elevatorORM, {
  foreignKey: "elevatro_stop_id",
});

module.exports = { elevatorORM, direction_listORM, carry_listORM };
