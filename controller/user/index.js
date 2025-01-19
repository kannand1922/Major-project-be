import { checkProductInCartQuery,insertProductQuery ,updateProductCountQuery,removeProductFromCartQuery,fetchCartItemsQuery} from "../../queries/user/index.js";
import dbConnect from "../../config/db.js";



export const updateCart = async (req, res) => {
  const { categoryId, productId, action } = req.body;

  if (!['add', 'remove'].includes(action.toLowerCase())) {
    return res.status(400).send({ message: "Invalid action" });
  }

  const connection = await dbConnect();
  try {
    const [existingProduct] = await connection.execute(checkProductInCartQuery(categoryId, productId), [categoryId, productId]);
    
    if (existingProduct.length === 0) {
      if (action.toLowerCase() === 'remove') {
        return res.status(400).send({ message: "Product not in cart to remove" });
      }
      await connection.execute(insertProductQuery(categoryId, productId), [categoryId, productId]);
      return res.status(200).send({ message: 'Product added to cart successfully' });
    }

    if (action.toLowerCase() === 'add') {
      await connection.execute(updateProductCountQuery(categoryId, productId, action.toLowerCase()), [1, categoryId, productId]);
      return res.status(200).send({ message: 'Product added to cart successfully' });
    }

    if (action.toLowerCase() === 'remove') {
      if (existingProduct[0].count === 1) {
        await connection.execute(removeProductFromCartQuery(categoryId, productId), [categoryId, productId]);
        return res.status(200).send({ message: 'Product removed from cart successfully' });
      } else {
        await connection.execute(updateProductCountQuery(categoryId, productId, action.toLowerCase()), [-1, categoryId, productId]);
        return res.status(200).send({ message: 'Product count decreased in cart successfully' });
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error updating cart" });
  }
};


export const fetchCartItems = async (req, res) => {
  try {
    const connection = await dbConnect();
    const cartQuery = `
      SELECT category_id, product_id, count
      FROM cart;
    `;
    const [cartRows] = await connection.execute(cartQuery);

    const cartItems = [];
    let totalPrice = 0; // Initialize total price

    for (const cartRow of cartRows) {
      // Fetch the category name from category_list
      const [categoryResult] = await connection.execute(
        'SELECT * FROM category_list WHERE id = ?',
        [cartRow.category_id]
      );

      if (categoryResult.length > 0) {
        const categoryName = categoryResult[0].name;

        // Fetch product details from the dynamic category table
        const productQuery = `SELECT * FROM \`${categoryName}\` WHERE id = ?`;
        const [productResult] = await connection.execute(productQuery, [cartRow.product_id]);

        if (productResult.length > 0) {
          const productPrice = productResult[0].price;
          const productTotal = productPrice * cartRow.count;

          // Add the product's total to the overall total price
          if(productTotal)
          totalPrice += productTotal;

          cartItems.push({
            category_id: cartRow.category_id,
            count: cartRow.count,
            category_name: categoryName,
            product_id: productResult[0].id,
            product_name: productResult[0].name,
            price: productPrice,
            total: productTotal, // Add total price for this product
          });
        }
      }
    }

    res.status(200).json({ cartItems, totalPrice }); // Return total price with cart items
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).send({ message: "Error fetching cart items" });
  }
};


export const fetchTableData = async (req, res) => {
  const { tableName } = req.params;

  try {
    const connection = await dbConnect();

    // Step 1: Fetch category ID based on category name (tableName)
    const categoryQuery = `SELECT id FROM category_list WHERE name = ?`;
    const [categoryRows] = await connection.execute(categoryQuery, [tableName]);

    // Check if the category exists
    if (categoryRows.length === 0) {
      return res.status(404).send({ message: "Category not found" });
    }

    const categoryId = categoryRows[0].id;

    // Step 2: Fetch products along with their counts from the cart
    const query = `
      SELECT 
         p.*, 
         COALESCE(c.count, 0) AS product_count
      FROM ${tableName} p
      LEFT JOIN cart c ON p.id = c.product_id AND c.category_id = ?
    `;

    const [rows] = await connection.execute(query, [categoryId]);

    // Step 3: Check if the cart data exists (if no rows, return error)
    if (rows.length === 0) {
      return res.status(404).send({ message: "No cart data found for this category" });
    }

    // Prepare the response
    const response = {
      data: rows,
      categoryId
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error fetching data" });
  }
};

export const saveOrder = async (req, res) => {
  const { user_id, items, total_price } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send({ message: "Items are required and must be an array with at least one item." });
  }

  // Validate that each item contains a product_id
  for (const item of items) {
    if (!item.product_id) {
      return res.status(400).send({ message: "Each item must have a valid product_id." });
    }
  }


  const connection = await dbConnect();
  try {
    const [addressResult] = await connection.execute(`
      SELECT address_id FROM address WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `, [user_id]);

    if (addressResult.length === 0) {
      return res.status(400).send({ message: "Address not found. Please provide an address." });
    }

    const address_id = addressResult[0].address_id;

    const [orderResult] = await connection.execute(`
      INSERT INTO orders (user_id, address_id, total_price)
      VALUES (?, ?, ?)
    `, [user_id, address_id, total_price]);

    const order_id = orderResult.insertId;

    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, category_id, quantity, total_price)
      VALUES ?
    `;
    const orderItemsValues = items.map(item => [
      order_id, 
      item.product_id, 
      item.category_id, 
      item.quantity, 
      item.price
    ]);

    console.log(orderItemsValues,"KKK")

    // Insert order items into the order_items table
    await connection.query(orderItemsQuery, [orderItemsValues]);
    await connection.execute(`
      DELETE FROM cart
    `,);
    res.status(200).send({ message: "Order saved successfully", orderId: order_id });
  } catch (error) {
    console.error("Error saving order:", error.message);
    res.status(500).send({ message: "Error saving order" });
  }
};





export const getUserOrderDetails = async (req, res) => {
  const { user_id } = req.params;

  const connection = await dbConnect();
  try {
    // Step 1: Fetch user order details
    const [orders] = await connection.execute(`
      SELECT o.order_id, o.total_price, o.created_at, 
             a.name, a.email, a.phone, a.address_line, a.city, a.state, a.pincode
      FROM orders o
      JOIN address a ON o.address_id = a.address_id
      WHERE o.user_id = ?
    `, [user_id]);

    if (orders.length === 0) {
      return res.status(404).send({ message: "No orders found for this user" });
    }

    // Step 2: Fetch order items and product details
    const orderDetailsPromises = orders.map(async (order) => {
      const [orderItems] = await connection.execute(`
        SELECT oi.order_id, oi.product_id, oi.category_id, oi.quantity, oi.total_price
        FROM order_items oi
        WHERE oi.order_id = ?
      `, [order.order_id]);

      const productDetailsPromises = orderItems.map(async (item) => {
        const [categoryResult] = await connection.execute(`
          SELECT name FROM category_list WHERE id = ?
        `, [item.category_id]);

        if (categoryResult.length === 0) {
          throw new Error("Category not found");
        }

        const categoryName = categoryResult[0].name;

        const [productDetails] = await connection.execute(`
          SELECT * FROM \`${categoryName}\` WHERE id = ?
        `, [item.product_id]);

        return {
          ...item,
          productDetails: productDetails[0] || null
        };
      });

      const detailedItems = await Promise.all(productDetailsPromises);
      return {
        ...order,
        items: detailedItems
      };
    });

    const detailedOrders = await Promise.all(orderDetailsPromises);
    res.status(200).send({ orders: detailedOrders });

  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).send({ message: "Error fetching order details" });
  }
};



export const postAddress = async (req, res) => {
  const { userId, name, email, phone, address, city, state, pincode } = req.body;

  const connection = await dbConnect();
  try {
    // Check if the user already has an address
    const [existingAddress] = await connection.execute(`
      SELECT address_id FROM address WHERE user_id = ?
    `, [userId]);

    // If addresses exist for the user, delete them before saving the new one
    if (existingAddress.length > 0) {
      await connection.execute(`
        DELETE FROM address WHERE user_id = ?
      `, [userId]);
    }

    // Now save the new address
    const [result] = await connection.execute(`
      INSERT INTO address (user_id, name, email, phone, address_line, city, state, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, phone, address, city, state, pincode]);

    res.status(200).send({ message: "Address saved successfully", addressId: result.insertId });
  } catch (error) {
    console.error("Error saving address:", error.message);
    res.status(500).send({ message: "Error saving address" });
  }
};



export const checkUserAddress = async (req, res) => {
  const { user_id } = req.params; // Assuming user_id is sent in the request body

  const connection = await dbConnect();
  try {
    // Check if the user already has an address
    const [existingAddress] = await connection.execute(`
      SELECT address_id FROM address WHERE user_id = ?
    `, [user_id]);

    if (existingAddress.length > 0) {
      // If an address exists, return the address_id
      return res.status(200).send({ message: "Address found", addressId: existingAddress[0].address_id });
    } else {
      // If no address is found, return an error message
      return res.status(404).send({ message: "No address found for this user" });
    }
  } catch (error) {
    console.error("Error checking address:", error.message);
    return res.status(500).send({ message: "Error checking address" });
  }
};

