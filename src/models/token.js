const { Model } = require('sequelize');
const { tokenTypes } = require('../config/tokens');

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    static associate(models) {
      // define association here
      Token.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }
  Token.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL),
        defaultValue: tokenTypes.ACCESS,
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Token',
    }
  );
  return Token;
};
