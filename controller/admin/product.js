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
    const query = fetchTableDataQuery(tableName);
    const [rows] = await connection.execute(query);

    res.status(200).json(rows);
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
