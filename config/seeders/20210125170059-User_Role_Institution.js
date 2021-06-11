'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'User_Role_Institutions'
   }, [
    {
      UserId: 1,
      RoleId: 1,
      InstitutionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      UserId: 2,
      RoleId: 3,
      InstitutionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
   ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'User_Role_Institutions'
    }, null, {});
  }
};
