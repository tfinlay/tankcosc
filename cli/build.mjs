import esbuild from "esbuild";
import fs from "fs";

// Delete Dist
if (fs.existsSync("bin")) {
  fs.rmdirSync("bin", { recursive: true });
}

// Build Project
await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outdir: "bin",
  sourcemap: true
})