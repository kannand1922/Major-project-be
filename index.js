import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/db.js';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from './middleware/index.js';
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const __dirname = path.resolve();
const routesPath = path.join(__dirname, 'routes');


app.use((req, res, next) => {
  const excludedPaths = ['/auth/register']; 
  console.log(req.path)
  if (excludedPaths.includes(req.path)) {
    return next(); 
  }
  return authMiddleware(req, res, next);
});



// Automatically load routes from each folder inside "routes" directory
fs.readdirSync(routesPath).forEach((folderName) => {
  const folderPath = path.join(routesPath, folderName);

  if (fs.statSync(folderPath).isDirectory()) {
    const indexFilePath = path.join(folderPath, 'index.js');

    if (fs.existsSync(indexFilePath)) {
      import(indexFilePath)
        .then((routeModule) => {
          app.use(`/${folderName.toLowerCase()}`, routeModule.default);
        })
        .catch((err) => {
          console.error(`Error loading route from ${indexFilePath}:`, err);
        });
    }
  }
});

dbConnect();

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
