/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const data = [];
    const password = await bcrypt.hash('testing1234', 8);
    for (let i = 0; i < 5; i++) {
      const seedData = {
        email: faker.internet.email(),
        is_verified: true,
        password,
      };
      data.push(seedData);
    }
    await queryInterface.bulkInsert('Users', data);
  },

  async down(queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});
  },
};
