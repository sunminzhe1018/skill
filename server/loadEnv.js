import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(examplePath)) {
  dotenv.config({ path: examplePath });
  console.warn(
    "⚠ 未找到 .env，已临时使用 .env.example。建议执行: copy .env.example .env"
  );
}
