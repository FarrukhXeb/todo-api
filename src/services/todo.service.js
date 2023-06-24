const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { Todo, User } = require('../models');
const ApiError = require('../utils/ApiError');

const getUserTodos = (userId) => {
  return Todo.findAll({ where: { user_id: userId } });
};

const createTodo = async (todoBody, userId) => {
  // Check if the user can add a new task
  const todos = await getUserTodos(userId);
  const today = new Date().toLocaleDateString();
  const count = todos.filter((todo) => new Date(todo.createdAt).toLocaleDateString() === today).length;
  if (count > 50) throw new ApiError(httpStatus.BAD_GATEWAY, 'You have reached the maximum limit of tasks for today.');
  return Todo.create({ ...todoBody, user_id: userId });
};

const getUserTodoById = async (todoId, userId) => {
  const todo = await Todo.findOne({ where: { id: todoId, user_id: userId } });
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  return todo;
};

const updateTodoById = async (todoId, userId, updateBody) => {
  const todo = await getUserTodoById(todoId, userId);
  Object.assign(todo, updateBody);
  await todo.save();
  return todo;
};

const deleteUserTodo = async (todoId, userId) => {
  const todo = await getUserTodoById(todoId, userId);
  await todo.destroy();
};

const getUserTodosByStatusCount = async (userId) => {
  const incompleteCount = await Todo.count({ where: { status: 'incomplete', user_id: userId } });
  const inProgressCount = await Todo.count({ where: { status: 'in-progress', user_id: userId } });
  const completeCount = await Todo.count({ where: { status: 'complete', user_id: userId } });
  const totalCount = await Todo.count({ where: { user_id: userId } });

  return { incompleteCount, inProgressCount, completeCount, totalCount };
};

const getAverageTodoCompletedByUser = async (userId) => {
  const { createdAt } = await User.findByPk(userId);
  // Calculate the number of days since account creation
  const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const currentDate = new Date();
  const daysElapsed = Math.floor((currentDate - createdAt) / millisecondsPerDay) + 1;

  // Calculate the total number of completed tasks
  const completedCount = await Todo.count({
    where: {
      user_id: userId,
      status: 'complete',
    },
  });

  // Calculate the average tasks completed per day
  return completedCount / daysElapsed;
};

const getOverdueTodosByUser = async (userId) => {
  const currentDate = new Date();
  const overdueCount = await Todo.count({
    where: {
      dueDate: {
        [Op.lt]: currentDate,
      },
      status: 'incomplete',
      user_id: userId,
    },
  });
  return overdueCount;
};

const findSimilarTodo = async (todoId, userId) => {
  const todo = await getUserTodoById(todoId, userId);
  const { title, description } = todo;

  // Find similar tasks
  const similarTasks = await Todo.findAll({
    where: {
      [Op.or]: [{ title: { [Op.like]: `%${title}%` } }, { description: { [Op.like]: `%${description}%` } }],
      id: {
        [Op.ne]: todoId,
      },
    },
  });
  return similarTasks;
};

module.exports = {
  createTodo,
  getUserTodos,
  getUserTodoById,
  updateTodoById,
  deleteUserTodo,
  getUserTodosByStatusCount,
  getAverageTodoCompletedByUser,
  getOverdueTodosByUser,
  findSimilarTodo,
};
