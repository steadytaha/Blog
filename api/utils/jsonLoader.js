import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function loadJsonFile(filePath) {
  // Resolve path from the project root (assuming the script is run from the project root)
  const absolutePath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  
  try {
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading JSON file at ${absolutePath}:`, error);
    process.exit(1);
  }
} 