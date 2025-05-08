'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const roles = [
      {
        id: 1,
        name: 'Admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'User',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const role of roles) {
      const existingRole = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE id = ${role.id}`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (existingRole.length > 0) {
        await queryInterface.sequelize.query(
          `UPDATE roles SET name = '${role.name}', updated_at = '${role.updated_at.toISOString()}' WHERE id = ${role.id}`
        );
      } else {
        await queryInterface.sequelize.query(
          `INSERT INTO roles (id, name, created_at, updated_at) VALUES (${role.id}, '${role.name}', '${role.created_at.toISOString()}', '${role.updated_at.toISOString()}')`
        );
      }
    }
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
