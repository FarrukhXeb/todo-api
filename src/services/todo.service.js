const httpStatus = require('http-status');
const { Todo } = require('../models');
const ApiError = require('../utils/ApiError');

const createTodo = (todoBody, userId) => {
  return Todo.create({ ...todoBody, user_id: userId });
};

const getUserTodos = (userId) => {
  return Todo.findAll({ where: { user_id: userId } });
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

module.exports = {
  createTodo,
  getUserTodos,
  getUserTodoById,
  updateTodoById,
};
