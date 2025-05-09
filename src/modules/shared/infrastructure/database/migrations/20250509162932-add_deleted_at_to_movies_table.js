'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('movies', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'updated_at',
    });

    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE movies DROP CONSTRAINT movies_external_id_key;',
      );
    } catch (error) {
      console.log(
        'Could not drop constraint, it might not exist:',
        error.message,
      );
    }

    try {
      await queryInterface.removeIndex('movies', 'movies_external_id_idx');
    } catch (error) {
      console.log('Could not remove index, it might not exist:', error.message);
    }

    await queryInterface.addIndex('movies', ['external_id'], {
      name: 'movies_external_id_unique',
      unique: true,
      where: {
        deleted_at: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex('movies', 'movies_external_id_unique');
    } catch (error) {
      console.log('Could not remove index, it might not exist:', error.message);
    }

    await queryInterface.sequelize.query(
      'ALTER TABLE movies ADD CONSTRAINT movies_external_id_key UNIQUE (external_id);',
    );

    await queryInterface.addIndex('movies', ['external_id'], {
      name: 'movies_external_id_idx',
    });

    await queryInterface.removeColumn('movies', 'deleted_at');
  },
};
