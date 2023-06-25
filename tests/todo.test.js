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
  let user1;
  let user2;
  let accessToken1;
  let accessToken2;
  let newTodo;

  beforeAll(async () => {
    user1 = await userService.createUser({ email: 'test1@example.com', password: 'testing1234', is_verified: true });
    user2 = await userService.createUser({ email: 'test2@example.com', password: 'testing1234', is_verified: true });
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    accessToken1 = tokenService.generateToken(user1.id, accessTokenExpires, tokenTypes.ACCESS);
    accessToken2 = tokenService.generateToken(user2.id, accessTokenExpires, tokenTypes.ACCESS);
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
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(_todo)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should give 400 if not provided proper due date to the body when creating todo', async () => {
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send({ ...newTodo, dueDate: 'somedate' })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if the todo list exceeds more then 50 in a single day', async () => {
      const data = [];
      // Create 51 todos
      for (let i = 0; i < 51; i += 1) {
        data.push(
          Todo.create({
            title: faker.lorem.lines(1),
            description: faker.lorem.paragraph(2),
            dueDate: faker.date.future().toISOString(),
            user_id: user2.id,
          })
        );
      }
      await Promise.all(data);
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken2}`)
        .send({
          title: faker.lorem.lines(1),
          description: faker.lorem.paragraph(2),
          dueDate: faker.date.future().toISOString(),
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 201 and successfully create new todo if data is ok', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken1}`)
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
        user_id: user1.id,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const todoFromDb = await todoService.getUserTodoById(res.body.id, user1.id);
      expect(todoFromDb).toBeDefined();
    });
  });

  describe('GET /api/todos', () => {
    test('should return 401 when getting a list of todos without authentication', async () => {
      await request(app).get('/api/todos').expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 200 and getting a list of todos', async () => {
      const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${accessToken1}`).expect(httpStatus.OK);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /api/todos/:id', () => {
    test('should return 401 when getting a single todo without authentication', async () => {
      await request(app).get(`/api/todos/${newTodo.id}`).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if todo not found', async () => {
      await request(app).get('/api/todos/99').set('Authorization', `Bearer ${accessToken1}`).expect(httpStatus.NOT_FOUND);
    });

    test('should return 200 if todo found', async () => {
      await request(app)
        .get(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(httpStatus.OK);
    });
  });

  describe('PUT /api/todos/:id', () => {
    test('should return 401 when updating single todo without authentication', async () => {
      await request(app).put('/api/todos/1').expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if todo not found', async () => {
      await request(app).put('/api/todos/99').set('Authorization', `Bearer ${accessToken1}`).expect(httpStatus.NOT_FOUND);
    });

    test('should return 201 when updating single todo', async () => {
      const updatedBody = {
        title: 'Updated title',
      };
      await request(app)
        .put(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(updatedBody)
        .expect(httpStatus.NO_CONTENT);

      const updatedTodo = await todoService.getUserTodoById(newTodo.id, user1.id);

      expect(updatedTodo.title).toBe(updatedBody.title);
    });

    test('should return 201 when updating the status of the todo from incomplete to in-progress', async () => {
      const updatedBody = {
        status: 'in-progress',
      };
      await request(app)
        .put(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(updatedBody)
        .expect(httpStatus.NO_CONTENT);

      const updatedTodo = await todoService.getUserTodoById(newTodo.id, user1.id);

      expect(updatedTodo.status).toBe(updatedBody.status);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    test('should return 401 when deleting a todo without authentication', async () => {
      await request(app).delete(`/api/todos/${newTodo.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 204 when deleting a todo', async () => {
      await request(app)
        .delete(`/api/todos/${newTodo.id}`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      const dbTodo = await Todo.findByPk(newTodo.id);
      expect(dbTodo).toBeNull();
    });
  });

  describe('GET /:id/similar-todos', () => {
    let todo1;
    let todo2;
    beforeAll(() => {
      todo1 = {
        title: 'Some title',
        description: 'This is a description of the first todo',
        dueDate: faker.date.future().toISOString(),
      };
      todo2 = {
        title: 'Another title for testing',
        description: 'This is a description',
        dueDate: faker.date.future().toISOString(),
      };
    });
    test('should return 201 when creating 2 similar todos', async () => {
      const res1 = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(todo1)
        .expect(httpStatus.CREATED);
      todo1 = res1.body;

      const res2 = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(todo2)
        .expect(httpStatus.CREATED);
      todo2 = res2.body;
    });

    test('should return 200 when fetching similar todos', async () => {
      const res = await request(app)
        .get(`/api/todos/${todo1.id}/similar-todos`)
        .set('Authorization', `Bearer ${accessToken1}`)
        .expect(httpStatus.OK);

      expect(res.body).toBeDefined();
    });
  });

  afterAll(async () => {
    // After going through all the test remove the user
    await userService.deleteUserById(user1.id);
    await userService.deleteUserById(user2.id);
  });
});
