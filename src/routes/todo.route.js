const express = require('express');
const validate = require('../middlewares/validate');
const todoValidation = require('../validations/todo.validation');
const todoController = require('../controllers/todo.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, todoController.getAllUserTodos);
router.post('/', auth, validate(todoValidation.create), todoController.create);
router.get('/:id', auth, todoController.getTodoById);
router.put('/:id', auth, validate(todoValidation.update), todoController.updateUserTodoById);

module.exports = router;