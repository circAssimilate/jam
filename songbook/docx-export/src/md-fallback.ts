import * as fs from "fs";
import * as path from "path";

interface SongEntry {
  title: string;
  artist: string;
  content: string;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function writeMdFallback(
  songs: SongEntry[],
  outputDir: string
): string[] {
  fs.mkdirSync(outputDir, { recursive: true });

  return songs.map((song) => {
    const filename = `${sanitizeFilename(song.title)}.md`;
    const filepath = path.join(outputDir, filename);
    const content = `# ${song.title} — ${song.artist}\n\n\`\`\`\n${song.content}\n\`\`\`\n`;
    fs.writeFileSync(filepath, content);
    return filepath;
  });
}
