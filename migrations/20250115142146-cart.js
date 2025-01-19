'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS cart (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      product_id BIGINT NOT NULL,
      category_id BIGINT NOT NULL,
      count INT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
  `)
  .then(() => db.runSql(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      address_id BIGINT NOT NULL,
      total_price BIGINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
  `))
  .then(() => db.runSql(`
    CREATE TABLE IF NOT EXISTS order_items (
      item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      order_id BIGINT NOT NULL,
      product_id BIGINT NOT NULL,
      category_id BIGINT NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
  `))
  
  .then(() => db.runSql(`
    CREATE TABLE IF NOT EXISTS address (
      address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address_line VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
  `));
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS cart;
    DROP TABLE IF EXISTS address;
  `);
};

exports._meta = {
  "version": 1
};
