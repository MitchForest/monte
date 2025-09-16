import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const nameArg = (process.argv[2] ?? "migration")
  .toLowerCase()
  .replace(/[^a-z0-9-_]/g, "-");

function pad(value) {
  return String(value).padStart(2, "0");
}

const now = new Date();
const ts = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}_${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
const dir = path.resolve(process.cwd(), "migrations");
fs.mkdirSync(dir, { recursive: true });
const filename = `${ts}__${nameArg}.sql`;
const filePath = path.join(dir, filename);
const template = `-- ${filename}\n-- Write your SQL migration here\nBEGIN;\n\nCOMMIT;\n`;

try {
  fs.writeFileSync(filePath, template, { flag: "wx" });
  process.stdout.write(`Created ${path.relative(process.cwd(), filePath)}\n`);
} catch (error) {
  process.stdout.write(
    `Failed to create migration: ${String(error?.message ?? error)}\n`,
  );
  process.exit(1);
}
