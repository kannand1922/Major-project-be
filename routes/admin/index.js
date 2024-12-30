import { Router } from "express";
import {
  insertProductData,
  fetchTableData,
  updateProductById,
  fetchProductById,
  deleteProductById
} from "../../controller/admin/product.js";
import {
  insertCategory,
  fetchCategoryList,
  createTable,
  getTableColumns,
  addColumnToTable,
  deleteCategory
} from "../../controller/admin/category.js";
const router = Router();

//to create category structure
router.post("/create-table/:tableName", createTable);

//to insert product Data
router.post("/insert-data/:tableName", insertProductData);

//to fetch dynmaic table values using table name
router.get("/fetch-products/:tableName", fetchTableData);

//to store list of category
router.post("/insert-category", insertCategory);

//t0 fetch category list
router.get("/fetch-category-list", fetchCategoryList);

//To get columns names of catgeory
router.get("/:tableName/columns", getTableColumns);

router.put("/update-product/:tableName/:id", updateProductById);

router.delete("/delete-product/:tableName/:productId", deleteProductById);

router.get("/:tableName/:id", fetchProductById);

router.delete("/:tableName/category", deleteCategory);

// Add a column to an existing table
router.post("/add-column", addColumnToTable);
export default router;
