import * as fs from "fs";
import * as path from "path";
import { buildDocx } from "./docx-builder";
import { writeMdFallback } from "./md-fallback";

interface SongEntry {
  title: string;
  artist: string;
  content: string;
}

interface ExportInput {
  songs: SongEntry[];
  outputPath?: string;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const raw = await readStdin();
  let input: ExportInput;

  try {
    input = JSON.parse(raw);
  } catch {
    console.error("Failed to parse JSON input from stdin.");
    process.exit(1);
  }

  if (!input.songs || !Array.isArray(input.songs) || input.songs.length === 0) {
    console.error("No songs provided. Expected { songs: [...] }");
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const outputPath = input.outputPath || `output/songbook-${date}.docx`;
  const outputDir = path.dirname(outputPath);

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    await buildDocx(input.songs, outputPath);
    console.log(`Created: ${outputPath}`);
  } catch (err) {
    console.error(`docx generation failed: ${err}`);
    console.error("Falling back to individual .md files.");
    const paths = writeMdFallback(input.songs, outputDir);
    paths.forEach((p) => console.log(`Created: ${p}`));
  }
}

main();
