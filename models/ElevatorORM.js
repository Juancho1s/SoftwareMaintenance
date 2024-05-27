const { Sequelize, DataTypes } = require("sequelize");
const { dbCredentials } = require("../general");

const sequelize = new Sequelize(dbCredentials);

/* This code snippet is defining a Sequelize model named `elevatorORM` that represents the "elevator"
table in the database. Here's a breakdown of what each part of the `sequelize.define` function call
is doing:
- `elevatorORM`: This is the name of the Sequelize model being defined.
- `elevator`: This is the name of the table in the database that this model represents.
- `DataTypes`: This is an object that contains the data types that Sequelize supports. We're
  using it to specify the data types for each column in the "elevator" table.
*/
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


/* This code snippet is defining another Sequelize model named `direction_listORM` that represents the
"direction_list" table in the database. Here's a breakdown of what each part of the
`sequelize.define` function call is doing:
- `direction_listORM`: This is the name of the Sequelize model being defined.
- `direction_list`: This is the name of the table in the database that this model represents.
*/
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
/* `elevatorORM.hasMany(direction_listORM);` is establishing a one-to-many relationship between the
`elevatorORM` model and the `direction_listORM` model in Sequelize. */
elevatorORM.hasMany(direction_listORM);

/* This line of code `direction_listORM.belongsTo(elevatorORM, { foreignKey: "elevator_direction_id"
});` is establishing a many-to-one relationship between the `direction_listORM` model and the
`elevatorORM` model in Sequelize. */
direction_listORM.belongsTo(elevatorORM, {
  foreignKey: "elevator_direction_id",
});

module.exports = { elevatorORM, direction_listORM, maintenance_floorsORM };
