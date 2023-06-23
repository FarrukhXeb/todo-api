const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { todoService } = require('../services');

const create = catchAsync(async (req, res) => {
  const todo = await todoService.createTodo(req.body, req.user.id);
  res.status(httpStatus.CREATED).send({ todo });
});

const getAllUserTodos = catchAsync(async (req, res) => {
  const todo = await todoService.getUserTodos(req.user.id);
  res.status(httpStatus.OK).send({ todo });
});

const getTodoById = catchAsync(async (req, res) => {
  const todo = await todoService.getUserTodoById(req.params.id, req.user.id);
  res.status(httpStatus.OK).send({ todo });
});

const updateUserTodoById = catchAsync(async (req, res) => {
  await todoService.updateTodoById(req.params.id, req.user.id, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  create,
  getAllUserTodos,
  getTodoById,
  updateUserTodoById,
};
