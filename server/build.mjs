import esbuild from "esbuild";
import fs from "fs";
import pkg from 'ncp';
const { ncp } = pkg;

// Delete Dist
if (fs.existsSync("dist")) {
    fs.rmdirSync("dist", { recursive: true });
}

// Copy public
await ncp("public", "dist")

// Build Project
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outdir: "dist",
    sourcemap: true
})