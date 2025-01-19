export const checkProductInCartQuery = (categoryId, productId) => {
  return `
    SELECT count FROM cart
    WHERE category_id = ? AND product_id = ?;
  `;
};

export const insertProductQuery = (categoryId, productId) => {
  return `
    INSERT INTO cart (category_id, product_id, count)
    VALUES (?, ?, 1);
  `;
};

export const updateProductCountQuery = (categoryId, productId, action) => {
  const adjustment = action === 'add' ? 1 : -1;
  return `
    UPDATE cart
    SET count = count + ?
    WHERE category_id = ? AND product_id = ? AND count > 0;
  `;
};

export const removeProductFromCartQuery = (categoryId, productId) => {
  return `
    DELETE FROM cart
    WHERE category_id = ? AND product_id = ? AND count = 1;
  `;
};

  

  export const fetchCartItemsQuery = () => {
    return `
      SELECT c.product_id, c.category_id, c.count, p.name as product_name, cl.name as category_name
      FROM cart c
      JOIN products p ON c.product_id = p.id
      JOIN category_list cl ON c.category_id = cl.id
    `;
  };
  