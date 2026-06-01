const fs = require("fs");
const path = require("path");

const uploadsDir = "./uploads";
const jsonFile = "./products.json";

const products = JSON.parse(fs.readFileSync(jsonFile, "utf8"));

const keepFiles = new Set(
  products
    .filter(item => item.image)
    .map(item => path.basename(item.image))
);

console.log(`Found ${keepFiles.size} images to keep`);

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath); // recurse into subfolder
    } else {
      if (!keepFiles.has(item)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted: ${fullPath}`);
      } else {
        console.log(`Kept: ${fullPath}`);
      }
    }
  }
}

processDirectory(uploadsDir);

console.log("Cleanup complete.");