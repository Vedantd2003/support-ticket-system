import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import { CATEGORIES, PRIORITIES, STATUSES, DEFAULT_CATEGORY, DEFAULT_PRIORITY, DEFAULT_STATUS } from '../config/constants.js';

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { len: [1, 200], notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false,
      defaultValue: DEFAULT_CATEGORY,
    },
    priority: {
      type: DataTypes.ENUM(...PRIORITIES),
      allowNull: false,
      defaultValue: DEFAULT_PRIORITY,
    },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: DEFAULT_STATUS,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'tickets',
    timestamps: true,
  }
);

Ticket.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });

export default Ticket;
