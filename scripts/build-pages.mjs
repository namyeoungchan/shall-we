import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const renamed = [];

async function collectRoutes(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectRoutes(fullPath);
    if (entry.isFile() && entry.name === "route.ts") {
      renamed.push([fullPath, `${fullPath}.pages-disabled`]);
    }
  }
}

await collectRoutes(path.join(root, "app", "api"));
renamed.push([
  path.join(root, "app", "admin", "page.tsx"),
  path.join(root, "app", "admin", "page.tsx.pages-disabled"),
]);

try {
  for (const [source, destination] of renamed) await fs.rename(source, destination);
  execFileSync(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"], {
    cwd: root,
    env: { ...process.env, GITHUB_PAGES: "true", NEXT_PUBLIC_STATIC_EXPORT: "true" },
    stdio: "inherit",
  });
  await fs.writeFile(path.join(root, "out", ".nojekyll"), "");
} finally {
  for (const [source, destination] of renamed.reverse()) {
    try { await fs.rename(destination, source); } catch {}
  }
}
