import dbConnect from "../../config/db.js";
import {
  insertProductDataQuery,
  fetchTableDataQuery,
  updateProductDataQuery,
  deleteProductByIdQuery
} from "../../queries/admin/product.js";
import { S3Upload } from "../../aws/index.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

export const insertProductData = [
  upload.single("image"),
  async (req, res) => {
    const { tableName } = req.params;
    const data = req.body;
    const file = req.file;

    try {
      if (file) {
        const imageUrl = await S3Upload(file);
        data.image_url = imageUrl;
      }

      const connection = await dbConnect();
      const query = insertProductDataQuery(tableName, data);
      await connection.execute(query, Object.values(data));

      res.status(201).send({ message: "Data inserted successfully", data });
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).send({ message: "Error inserting data" });
    }
  },
];

export const fetchTableData = async (req, res) => {
  const { tableName } = req.params;

  try {
    const connection = await dbConnect();
    const query = `SELECT * FROM ${tableName}`;
    const [rows] = await connection.execute(query);

    const categoryQuery = `SELECT id FROM category_list WHERE name = ?`;
    const [categoryRows] = await connection.execute(categoryQuery, [tableName]);

    const categoryId = categoryRows.length ? categoryRows[0].id : null;

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

export const updateProductById = async (req, res) => {
  const { tableName } = req.params;
  const { id } = req.params; // Assuming ID is passed as a route parameter
  const data = req.body; // Assuming the updated data is sent in the request body

  try {
    const connection = await dbConnect();
    const query = updateProductDataQuery(tableName, data, id);
    const values = [...Object.values(data), id]; // Add id to the values array
    const [result] = await connection.execute(query, values);

    if (result.affectedRows > 0) {
      res.status(200).send({ message: "Product updated successfully" });
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error updating product" });
  }
};


export const fetchProductById = async (req, res) => {
  const { tableName } = req.params;
  const { id } = req.params; // Assuming ID is passed as a route parameter

  try {
    const connection = await dbConnect();
    const query = fetchProductByIdQuery(tableName);
    const [rows] = await connection.execute(query, [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]); // Return the product as JSON
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error fetching product" });
  }
};

export const deleteProductById = async (req, res) => {
  const { tableName, productId } = req.params;

  try {
    const connection = await dbConnect();
    const query = deleteProductByIdQuery(tableName, "id");
    await connection.execute(query, [productId]);

    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).send({ message: "Error deleting product" });
  }
};


export const getAllOrderDetails = async (req, res) => {
  const connection = await dbConnect();
  try {
    // Step 1: Fetch all order details
    const [orders] = await connection.execute(`
      SELECT o.order_id, o.total_price, o.created_at, 
             a.name, a.email, a.phone, a.address_line, a.city, a.state, a.pincode
      FROM orders o
      JOIN address a ON o.address_id = a.address_id
    `);

    if (orders.length === 0) {
      return res.status(404).send({ message: "No orders found" });
    }

    // Step 2: Fetch order items and product details for each order
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
    console.error("Error fetching all order details:", error.message);
    res.status(500).send({ message: "Error fetching all order details" });
  }
};
