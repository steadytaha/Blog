import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function loadJsonFile(filePath) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const absolutePath = path.resolve(__dirname, filePath);
  
  try {
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading JSON file at ${absolutePath}:`, error);
    process.exit(1);
  }
} 