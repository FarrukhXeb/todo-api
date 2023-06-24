/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const data = [];
    const users = await queryInterface.sequelize.query('SELECT id FROM Users;');
    const userIds = users[0].map((user) => user.id);
    for (let i = 0; i < 50; i++) {
      const seedData = {
        title: faker.lorem.lines(1),
        description: faker.lorem.paragraph(2),
        dueDate: faker.date.anytime(),
        user_id: faker.helpers.arrayElement(userIds),
        status: faker.helpers.arrayElement(['complete', 'incomplete', 'in-progress']),
      };
      data.push(seedData);
    }
    return queryInterface.bulkInsert('Todos', data);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('Todos', null, {});
  },
};
