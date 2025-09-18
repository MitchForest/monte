#!/usr/bin/env bun
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

interface ApiSpec {
  name: string;
  url: string;
  filename: string;
}

const API_SPECS: ApiSpec[] = [
  {
    name: "Caliper API",
    url: "https://caliper.alpha-1edtech.com/caliper/openapi.yaml",
    filename: "caliper-api.md",
  },
  {
    name: "Timeback Events API",
    url: "https://caliper.alpha-1edtech.com/timeback/openapi.yaml",
    filename: "timeback-events-api.md",
  },
  {
    name: "Webhooks API",
    url: "https://caliper.alpha-1edtech.com/webhooks/openapi.yaml",
    filename: "webhooks-api.md",
  },
  {
    name: "QTI API",
    url: "https://qti.alpha-1edtech.com/openapi.yaml",
    filename: "qti-api.md",
  },
  {
    name: "OneRoster API",
    url: "https://api.alpha-1edtech.com/oneroster/openapi.yaml",
    filename: "oneroster-api.md",
  },
  {
    name: "PowerPath API",
    url: "https://api.alpha-1edtech.com/powerpath/openapi.yaml",
    filename: "powerpath-api.md",
  },
  {
    name: "CASE API",
    url: "https://api.alpha-1edtech.com/case/openapi.yaml",
    filename: "case-api.md",
  },
  {
    name: "EduBridge API",
    url: "https://api.alpha-1edtech.com/edubridge/openapi.yaml",
    filename: "edubridge-api.md",
  },
  {
    name: "OpenBadges API",
    url: "https://api.alpha-1edtech.com/openBadges/openapi.yaml",
    filename: "openbadges-api.md",
  },
  {
    name: "CLR API",
    url: "https://api.alpha-1edtech.com/clr/openapi.yaml",
    filename: "clr-api.md",
  },
];

const OUTPUT_DIR = join(process.cwd(), ".docs", "api");

async function fetchOpenApiSpec(url: string): Promise<string> {
  console.log(`📥 Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

async function generateApiDocs() {
  console.log("🚀 Starting API documentation generation...\n");

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}\n`);
  }

  const results = await Promise.allSettled(
    API_SPECS.map(async (spec) => {
      try {
        // Fetch the OpenAPI spec
        const yamlContent = await fetchOpenApiSpec(spec.url);

        // Convert to markdown
        console.log(`🔄 Converting ${spec.name} to Markdown...`);
        const markdown = await createMarkdownFromOpenApi(yamlContent);

        // Add header with metadata
        const enhancedMarkdown = `# ${spec.name}

> Generated from: ${spec.url}
> Generated on: ${new Date().toISOString()}

---

${markdown}`;

        // Write to file
        const outputPath = join(OUTPUT_DIR, spec.filename);
        await writeFile(outputPath, enhancedMarkdown, "utf-8");

        console.log(`✅ Generated: ${spec.filename}\n`);
        return { success: true, name: spec.name, file: spec.filename };
      } catch (error) {
        console.error(`❌ Failed to generate ${spec.name}:`, error);
        return { success: false, name: spec.name, error: error.message };
      }
    }),
  );

  // Summary
  console.log("\n📊 Generation Summary:");
  console.log("=".repeat(50));

  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value.success,
  );
  const failed = results.filter(
    (r) =>
      r.status === "rejected" || (r.status === "fulfilled" && !r.value.success),
  );

  console.log(
    `✅ Successfully generated: ${successful.length}/${API_SPECS.length}`,
  );
  if (successful.length > 0) {
    successful.forEach((r) => {
      if (r.status === "fulfilled" && r.value.success) {
        console.log(`   - ${r.value.file}`);
      }
    });
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach((r) => {
      if (r.status === "fulfilled" && !r.value.success) {
        console.log(`   - ${r.value.name}: ${r.value.error}`);
      } else if (r.status === "rejected") {
        console.log(`   - Error: ${r.reason}`);
      }
    });
  }

  console.log("\n📍 Output directory:", OUTPUT_DIR);
}

// Run the script
generateApiDocs().catch(console.error);
