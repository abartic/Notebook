/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('accounts', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        accountDescr: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.TIME,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {
        tableName: 'accounts'
    });
};