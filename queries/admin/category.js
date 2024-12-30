
  
  // Query to insert a new category
  export const insertCategoryQuery = (name) => {
    return `INSERT INTO category_list (name) VALUES ('${name}')`;
  };
  
  
  // Query to fetch all categories
  export const fetchCategoryQuery = () => {
    return `SELECT * FROM category_list`;
  };
  
  export const fetchTableColumnsQuery = (tableName) => {
    return `
      SHOW COLUMNS FROM \`${tableName}\`
      WHERE Field NOT IN ('id', 'image_url')
    `;
  };
  
  
  export const createTableQuery = (tableName, fields) => {
    if (!fields || fields.length === 0) {
      throw new Error("Fields cannot be empty");
    }
  
    const idColumn = '`id` BIGINT AUTO_INCREMENT PRIMARY KEY';
    const imageUrlColumn = '`image_url` VARCHAR(255)';
  
    const fieldDefinitions = fields.map((field) => {
      if (!field.name || !field.type) {
        throw new Error("Each field must have a name and a type");
      }
      let definition = `\`${field.name}\` ${field.type}`;
      if (field.notNull) definition += " NOT NULL";
      if (field.autoIncrement) definition += " AUTO_INCREMENT"; // Rare, usually only `id`
      if (field.primaryKey) definition += " PRIMARY KEY"; // Rare, usually only `id`
      return definition;
    });
  
    return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${[idColumn, imageUrlColumn, ...fieldDefinitions].join(", ")})`;
  };
  
  export const deleteCategoryQuery = (tableName) => {
    return `DROP TABLE IF EXISTS \`${tableName}\``;
  };
  export const deleteFromCategoryListQuery = `DELETE FROM category_list WHERE table_name = ?`;
 

  export const addColumnToTableQuery = (tableName, columnName, columnType, notNull, defaultValue) => {
    let query = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType}`;
    if (notNull) query += " NOT NULL";
    if (defaultValue) query += ` DEFAULT '${defaultValue}'`;
    return query;
  };