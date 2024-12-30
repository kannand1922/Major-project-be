// controller/categoryController.js
import dbConnect from "../../config/db.js";
import {
  insertCategoryQuery,
  fetchCategoryQuery,
  fetchTableColumnsQuery,
  createTableQuery,
  addColumnToTableQuery,
  deleteCategoryQuery
} from "../../queries/admin/category.js";



// Insert Category into Category List
export const insertCategory = async (name) => {
  try {
    const connection = await dbConnect();
    const query = insertCategoryQuery(name);
    const result=await connection.execute(query);
    return result;
  } catch (error) {
    console.error(error.message);
  }
};

// Fetch Category List
export const fetchCategoryList = async (req, res) => {
  try {
    const connection = await dbConnect();
    const query = fetchCategoryQuery();
    const [rows] = await connection.execute(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error fetching category list" });
  }
};

export const getTableColumns = async (req, res) => {
  const { tableName } = req.params;

  try {
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    const connection = await dbConnect();
    const [columns] = await connection.execute(fetchTableColumnsQuery(tableName));

    res.status(200).json({ message: "Columns fetched successfully", columns });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
};

//to create category structure
export const createTable = async (req, res) => {
  const { tableName } = req.params;
  const { data } = req.body;
  try {
    const connection = await dbConnect();
    console.log(data)
    const query = createTableQuery(tableName, data);
    const [result]=await connection.execute(query);
    await insertCategory(tableName)
   console.log("result",result)
    res.status(201).send({ message: "Table created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: "Error creating table" });
  }
};
export const deleteCategory = async (req, res) => {
  const connection = await dbConnect();

  const { tableName } = req.params;

  if (!tableName) {
    return res.status(400).json({ message: "Table name and category ID are required" });
  }

  try {
    const deleteFromCategoryListQuery = `DELETE FROM category_list WHERE name = ?`;
    await connection.execute(deleteFromCategoryListQuery, [tableName]);

    const query = deleteCategoryQuery(tableName);
    await connection.execute(query);
    res.status(200).json({ message: `Category deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

export const addColumnToTable = async (req, res) => {
  const connection = await dbConnect();

  const { tableName, ...columns } = req.body; // Extract tableName and column data from request body

  if (!tableName || !Object.keys(columns).length) {
    return res.status(400).json({ message: "Table name and columns are required" });
  }

  try {
    // Loop through the columns and construct the ALTER TABLE queries
    for (const columnKey in columns) {
      const { name, type, notNull, defaultValue } = columns[columnKey];

      // Ensure the column data is complete
      if (!name || !type) {
        return res.status(400).json({ message: "Column name and type are required" });
      }

      const query = addColumnToTableQuery(tableName, name, type, notNull, defaultValue);
      await connection.execute(query);
    }

    res.status(200).json({ message: `Columns added to ${tableName} successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error adding columns", error });
  }
};


