'use strict';

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db
    .runSql(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
    `)
    .then(() => db.runSql(`
      INSERT INTO roles (name)
      SELECT 'Admin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');
    `))
    .then(() => db.runSql(`
      INSERT INTO roles (name)
      SELECT 'User' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'User');
    `))
    .then(() => db.runSql(`
      INSERT INTO roles (name)
      SELECT 'Manager' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager');
    `))
    .then(() => db.runSql(`
      INSERT INTO roles (name)
      SELECT 'Editor' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Editor');
    `))
    .then(() => db.runSql(`
      CREATE TABLE IF NOT EXISTS category_list (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
    `))
    .then(() => db.createTable('users', {
      id: { type: 'bigint', primaryKey: true, autoIncrement: true },
      name: { type: 'string', notNull: true, length: 100 },
      email: { type: 'string', notNull: true, length: 150 },
      password: { type: 'string', notNull: true, length: 255 },
      role_id: { type: 'bigint', notNull: true },
      created_at: { type: 'datetime', notNull: true },
      updated_at: { type: 'datetime', notNull: true },
    }))
    .then(() => db.addForeignKey('users', 'roles', 'fk_users_role_id', 
      { role_id: 'id' }, 
      { onDelete: 'CASCADE' }
    ));
};

exports.down = function (db) {
  return db
    .removeForeignKey('users', 'fk_users_role_id')
    .then(() => db.dropTable('users'))
    .then(() => db.dropTable('category_list'))
    .then(() => db.dropTable('roles'));
};

exports._meta = {
  version: 1,
};
