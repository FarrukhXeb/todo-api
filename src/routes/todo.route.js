const express = require('express');
const validate = require('../middlewares/validate');
const todoValidation = require('../validations/todo.validation');
const { todoController } = require('../controllers');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, todoController.getAllUserTodos);
router.post('/', auth, validate(todoValidation.create), todoController.create);
router.get('/:id', auth, todoController.getTodoById);
router.put('/:id', auth, validate(todoValidation.update), todoController.updateUserTodoById);
router.delete('/:id', auth, todoController.deleteUserTodo);
// Reports
router.get('/report/satus-count', auth, todoController.getUserTodosByStatusCount);
router.get('/report/avg-completed', auth, todoController.getAverageTodoCompleted);
router.get('/report/overdue-count', auth, todoController.getOverdueTodos);
// Algorithm
router.get('/:id/similar-todos', auth, todoController.getSimilarTodos);

module.exports = router;
