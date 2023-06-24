const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { todoService } = require('../services');

const create = catchAsync(async (req, res) => {
  const todo = await todoService.createTodo(req.body, req.user.id);
  res.status(httpStatus.CREATED).send(todo);
});

const getAllUserTodos = catchAsync(async (req, res) => {
  const todos = await todoService.getUserTodos(req.user.id);
  res.status(httpStatus.OK).send(todos);
});

const getTodoById = catchAsync(async (req, res) => {
  const todo = await todoService.getUserTodoById(req.params.id, req.user.id);
  res.status(httpStatus.OK).send(todo);
});

const updateUserTodoById = catchAsync(async (req, res) => {
  await todoService.updateTodoById(req.params.id, req.user.id, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteUserTodo = catchAsync(async (req, res) => {
  await todoService.deleteUserTodo(req.params.id, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserTodosByStatusCount = catchAsync(async (req, res) => {
  const todos = await todoService.getUserTodosByStatusCount(req.user.id);
  res.status(httpStatus.OK).send(todos);
});

const getAverageTodoCompleted = catchAsync(async (req, res) => {
  const averageCount = await todoService.getAverageTodoCompletedByUser(req.user.id);
  res.status(httpStatus.OK).send({ averageCount });
});

const getOverdueTodos = catchAsync(async (req, res) => {
  const overdueCount = await todoService.getOverdueTodosByUser(req.user.id);
  res.status(httpStatus.OK).send({ overdueCount });
});

module.exports = {
  create,
  getAllUserTodos,
  getTodoById,
  updateUserTodoById,
  getUserTodosByStatusCount,
  getAverageTodoCompleted,
  getOverdueTodos,
  deleteUserTodo,
};
