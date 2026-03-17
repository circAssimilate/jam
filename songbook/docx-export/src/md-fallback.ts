import * as fs from "fs";
import * as path from "path";

interface SongEntry {
  title: string;
  artist: string;
  content: string;
}

function extractKey(content: string): string {
  const match = content.match(/^Key:\s+(.+)$/m);
  if (!match) return "Unknown";
  // Strip trailing [UNVERIFIED...] markers and extra info in parens like "(B Mixolydian)"
  return match[1].replace(/\s*\[UNVERIFIED.*$/, "").trim();
}

function songFilename(song: SongEntry, ext: string): string {
  const key = extractKey(song.content);
  // "Artist Name - Song Title (Key).ext" with filesystem-unsafe chars removed
  const base = `${song.artist} - ${song.title} (${key})`;
  return base.replace(/[\/\\:*?"<>|]/g, "") + ext;
}

export function writeMdFallback(
  songs: SongEntry[],
  outputDir: string
): string[] {
  fs.mkdirSync(outputDir, { recursive: true });

  return songs.map((song) => {
    const filename = songFilename(song, ".md");
    const filepath = path.join(outputDir, filename);
    const content = `# ${song.title} — ${song.artist}\n\n\`\`\`\n${song.content}\n\`\`\`\n`;
    fs.writeFileSync(filepath, content);
    return filepath;
  });
}
