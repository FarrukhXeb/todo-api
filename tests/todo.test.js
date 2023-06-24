const request = require('supertest');
const moment = require('moment');
const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const app = require('../src/app');
const { Todo } = require('../src/models');
const { tokenService, userService, todoService } = require('../src/services');
const config = require('../src/config/config');
const { tokenTypes } = require('../src/config/tokens');

describe('Todo routes', () => {
  let user;
  let accessToken;
  let newTodo;

  beforeAll(async () => {
    user = await userService.createUser({ email: 'test@example.com', password: 'testing1234', is_verified: true });
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    accessToken = tokenService.generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);
    newTodo = {
      title: faker.lorem.lines(1),
      description: faker.lorem.paragraph(2),
      dueDate: faker.date.future().toISOString(),
    };
  });

  describe('POST /api/todos', () => {
    test('should return 401 when creating a new todo without authentication', async () => {
      await request(app).post('/api/todos').expect(httpStatus.UNAUTHORIZED);
    });

    test('should give 400 if not provided proper body when creating todo', async () => {
      const _todo = { ...newTodo };
      delete _todo.title;
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(_todo)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should give 400 if not provided proper due date to the body when creating todo', async () => {
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...newTodo, dueDate: 'somedate' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 201 and successfully create new todo if data is ok', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTodo)
        .expect(httpStatus.CREATED);

      // Changing the new todo
      newTodo = res.body;

      expect(res.body).toEqual({
        id: expect.anything(),
        title: newTodo.title,
        description: newTodo.description,
        dueDate: newTodo.dueDate,
        status: 'incomplete',
        user_id: user.id,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const todoFromDb = await todoService.getUserTodoById(res.body.id, user.id);
      expect(todoFromDb).toBeDefined();
    });
  });

  describe('GET /api/todos', () => {
    test('should return 401 when getting a list of todos without authentication', async () => {
      await request(app).get('/api/todos').expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 200 and getting a list of todos', async () => {
      const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${accessToken}`).expect(httpStatus.OK);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/todos/:id', () => {
    test('should return 401 when getting a single todo without authentication', async () => {
      await request(app).get(`/api/todos/${newTodo.id}`).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if todo not found', async () => {
      await request(app).get('/api/todos/99').set('Authorization', `Bearer ${accessToken}`).expect(httpStatus.NOT_FOUND);
    });

    test('should return 200 if todo found', async () => {
      await request(app).get(`/api/todos/${newTodo.id}`).set('Authorization', `Bearer ${accessToken}`).expect(httpStatus.OK);
    });
  });

  describe('PUT /api/todos/:id', () => {
    test('should return 401 when updating single todo without authentication', async () => {
      await request(app).put('/api/todos/1').expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if todo not found', async () => {
      await request(app).put('/api/todos/99').set('Authorization', `Bearer ${accessToken}`).expect(httpStatus.NOT_FOUND);
    });

    test('should return 201 when updating single todo', async () => {
      const updatedBody = {
        title: 'Updated title',
      };
      await request(app)
        .put(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBody)
        .expect(httpStatus.NO_CONTENT);

      const updatedTodo = await todoService.getUserTodoById(newTodo.id, user.id);

      expect(updatedTodo.title).toBe(updatedBody.title);
    });

    test('should return 201 when updating the status of the todo from incomplete to in-progress', async () => {
      const updatedBody = {
        status: 'in-progress',
      };
      await request(app)
        .put(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedBody)
        .expect(httpStatus.NO_CONTENT);

      const updatedTodo = await todoService.getUserTodoById(newTodo.id, user.id);

      expect(updatedTodo.status).toBe(updatedBody.status);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    test('should return 401 when deleting a token without authentication', async () => {
      await request(app).delete(`/api/todos/${newTodo.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 204 when deleting a todo', async () => {
      await request(app)
        .delete(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      const dbTodo = await Todo.findByPk(newTodo.id);
      expect(dbTodo).toBeNull();
    });
  });

  afterAll(async () => {
    // After going through all the test remove the user
    await userService.deleteUserById(user.id);
  });
});
