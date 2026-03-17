import { execSync } from "child_process";
import * as path from "path";

/**
 * Extract plain text content from a .docx file.
 * Uses the system `unzip` utility to read word/document.xml,
 * then parses the XML to reconstruct the text with line breaks.
 */
export function readDocx(filePath: string): string {
  const absPath = path.resolve(filePath);

  // Extract word/document.xml from the .docx zip archive
  const xml = execSync(`unzip -p "${absPath}" word/document.xml`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });

  // Strip XML declaration if present
  const cleanXml = xml.replace(/<\?xml[^?]*\?>\s*/, "");

  const lines: string[] = [];
  let currentLine = "";

  // Split on XML tags and process
  // <w:p> = paragraph, <w:br/> = line break, <w:t ...>text</w:t> = text run
  const tagRegex = /<(\/?)(\w+:?\w*)[^>]*>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleanXml)) !== null) {
    const [, closing, tagName, text] = match;

    if (text !== undefined) {
      // Text content (inside <w:t> tags) — decoded below
      currentLine += text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    } else if (tagName === "w:p" && closing === "/") {
      // End of paragraph — push the line
      lines.push(currentLine);
      currentLine = "";
    } else if (tagName === "w:br") {
      lines.push(currentLine);
      currentLine = "";
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  return lines.join("\n");
}
