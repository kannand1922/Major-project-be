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
    .then(() => db.runSql(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id BIGINT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
    `));
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
