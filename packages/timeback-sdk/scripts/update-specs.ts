import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stringify } from "yaml";

const packageRoot = resolve(import.meta.dir, "..");
const specsDir = resolve(packageRoot, "specs");

const targets = [
  {
    name: "CoreAPI.yaml",
    url: "https://core.timebackapi.com/v2/openapi.json",
  },
  {
    name: "CaliperAPI.yaml",
    url: "https://caliper.timebackapi.com/openapi.json",
  },
];

async function fetchSpec(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("yaml")) {
    return response.text();
  }
  return response.json();
}

async function writeSpec(name: string, data: unknown): Promise<void> {
  await mkdir(specsDir, { recursive: true });
  const outputPath = resolve(specsDir, name);
  const payload = typeof data === "string" ? data : stringify(data);
  await writeFile(outputPath, payload, "utf8");
  process.stdout.write(`Updated ${name} \n`);
}

async function main() {
  for (const target of targets) {
    const data = await fetchSpec(target.url);
    await writeSpec(target.name, data);
  }

  process.stdout.write("Regenerating SDK from updated specs...\n");
  const generate = Bun.spawn({
    cmd: ["bun", "run", "generate"],
    cwd: packageRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await generate.exited;
  if (exitCode !== 0) {
    throw new Error(`Generation failed with exit code ${exitCode}`);
  }

  process.stdout.write(
    "Updated shared TimeBack schemas in packages/shared/src/timeback/generated\n"
  );
}

await main();
