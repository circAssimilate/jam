import * as fs from "fs";
import {
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
} from "docx";

interface SongEntry {
  title: string;
  artist: string;
  content: string;
}

function lineToParagraph(line: string): Paragraph {
  // Detect "Lyrics:  <url>" lines and render the URL as a clickable hyperlink.
  const lyricsMatch = line.match(/^(Lyrics:\s+)(https?:\/\/\S+?)\s*$/);
  if (lyricsMatch) {
    const [, label, url] = lyricsMatch;
    return new Paragraph({
      children: [
        new TextRun({ text: label, font: "Courier New", size: 20 }),
        new ExternalHyperlink({
          link: url,
          children: [
            new TextRun({
              text: url,
              font: "Courier New",
              size: 20,
              style: "Hyperlink",
            }),
          ],
        }),
      ],
      spacing: { after: 0, line: 240 },
    });
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: line || " ",
        font: "Courier New",
        size: 20, // 10pt
      }),
    ],
    spacing: { after: 0, line: 240 }, // single spacing
  });
}

function songToParagraphs(song: SongEntry, isLast: boolean): Paragraph[] {
  const lines = song.content.split(/\r?\n/);
  const paragraphs: Paragraph[] = lines.map(lineToParagraph);

  if (!isLast) {
    paragraphs.push(
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  return paragraphs;
}

export async function buildDocx(
  songs: SongEntry[],
  outputPath: string
): Promise<void> {
  const children: Paragraph[] = [];

  songs.forEach((song, i) => {
    const isLast = i === songs.length - 1;
    children.push(...songToParagraphs(song, isLast));
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}
