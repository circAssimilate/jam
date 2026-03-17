import * as fs from "fs";
import * as path from "path";
import { buildDocx } from "./docx-builder";
import { readDocx } from "./docx-reader";
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

function extractKey(content: string): string {
  const match = content.match(/^Key:\s+(.+)$/m);
  if (!match) return "Unknown";
  return match[1].replace(/\s*\[UNVERIFIED.*$/, "").trim();
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
  // --read mode: extract text from a .docx file and print to stdout
  if (process.argv[2] === "--read" && process.argv[3]) {
    const filePath = process.argv[3];
    try {
      const text = readDocx(filePath);
      process.stdout.write(text);
    } catch (err) {
      console.error(`Failed to read .docx: ${err}`);
      process.exit(1);
    }
    return;
  }

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

  const outputDir = input.outputPath
    ? path.dirname(input.outputPath)
    : "output";

  fs.mkdirSync(outputDir, { recursive: true });

  // When a single explicit outputPath is given, write one combined file
  if (input.outputPath && input.songs.length > 0) {
    try {
      await buildDocx(input.songs, input.outputPath);
      console.log(`Created: ${input.outputPath}`);
    } catch (err) {
      console.error(`docx generation failed: ${err}`);
      console.error("Falling back to individual .md files.");
      const paths = writeMdFallback(input.songs, outputDir);
      paths.forEach((p) => console.log(`Created: ${p}`));
    }
    return;
  }

  // Default: one .docx per song, named "Artist - Title (Key).docx"
  for (const song of input.songs) {
    const key = extractKey(song.content);
    const base = `${song.artist} - ${song.title} (${key})`;
    const safe = base.replace(/[\/\\:*?"<>|]/g, "");
    const outputPath = path.join(outputDir, `${safe}.docx`);

    try {
      await buildDocx([song], outputPath);
      console.log(`Created: ${outputPath}`);
    } catch (err) {
      console.error(`docx generation failed for "${song.title}": ${err}`);
      console.error("Falling back to .md for this song.");
      const paths = writeMdFallback([song], outputDir);
      paths.forEach((p) => console.log(`Created: ${p}`));
    }
  }
}

main();
