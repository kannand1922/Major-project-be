
  export const insertProductDataQuery = (tableName, data) => {
    const keys = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).map(() => "?").join(", ");
    return `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`;
  };
  
  export const fetchTableDataQuery = (tableName) => {
    return `SELECT * FROM ${tableName}`;
  };
  
  export const updateProductDataQuery = (tableName, data, id) => {
  const updates = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  return `UPDATE ${tableName} SET ${updates} WHERE id = ?`;
};

export const fetchProductByIdQuery = (tableName) => {
  return `SELECT * FROM ${tableName} WHERE id = ?`;
};

export const deleteProductByIdQuery = (tableName, idColumnName) => {
  return `DELETE FROM ${tableName} WHERE ${idColumnName} = ?`;
};
