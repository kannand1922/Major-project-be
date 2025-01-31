import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/db.js';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { authMiddleware } from './middleware/index.js';

const app = express();

// Initialize environment variables
dotenv.config();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get the current directory from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Corrected to work in ESM
const routesPath = path.join(__dirname, 'routes');

// Automatically load routes from each folder inside "routes" directory
fs.readdirSync(routesPath).forEach((folderName) => {
  const folderPath = path.join(routesPath, folderName);

  if (fs.statSync(folderPath).isDirectory()) {
    const indexFilePath = path.join(folderPath, 'index.js');

    if (fs.existsSync(indexFilePath)) {
      // Convert to file:// URL and dynamically import the route module
      const indexFileUrl = pathToFileURL(indexFilePath).href;

      import(indexFileUrl)
        .then((routeModule) => {
          app.use(`/${folderName.toLowerCase()}`, routeModule.default);
        })
        .catch((err) => {
          console.error(`Error loading route from ${indexFilePath}:`, err);
        });
    }
  }
});

const sqlFilePath = "/home/dell/Videos/mysql.sql";

app.get("/get-sql", (req, res) => {
  fs.readFile(sqlFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load SQL file" });
    }
    res.send(data);
  });
});
// Connect to the database
dbConnect();

// Start the server
const PORT = 4000; // Allow dynamic port assignment
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
