/* eslint-disable */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movies', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      episode_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      opening_crawl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      director: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      producer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      release_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      external_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('movies', ['external_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movies');
  },
};
