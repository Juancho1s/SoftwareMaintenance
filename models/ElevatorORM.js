const { Sequelize, DataTypes } = require("sequelize");
const { dbCredentials } = require("../general");

const sequelize = new Sequelize(dbCredentials);

const elevatorORM = sequelize.define(
  "elevator",
  {
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
    },
  },
  {
    timestamps: false,
  }
);

const direction_listORM = sequelize.define(
  "direction_list",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    direction_floor_number: {
      type: DataTypes.INTEGER,
    },
    elevator_direction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "elevators", // This references the table name directly
        key: "id",
      },
    },
  },
  {
    timestamps: false,
  }
);

const maintenance_floorsORM = sequelize.define("maintenance_floors", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  floor_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Set up associations
elevatorORM.hasMany(direction_listORM);

direction_listORM.belongsTo(elevatorORM, {
  foreignKey: "elevator_direction_id",
});

module.exports = { elevatorORM, direction_listORM, maintenance_floorsORM };
