const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasMany(models.Todo, {
        foreignKey: 'user_id',
        as: 'todos',
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Token, {
        foreignKey: 'user_id',
        as: 'tokens',
        onDelete: 'CASCADE',
      });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified',
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
