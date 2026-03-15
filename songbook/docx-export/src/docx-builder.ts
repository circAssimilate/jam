import * as fs from "fs";
import {
  Document,
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

function songToParagraphs(song: SongEntry, isLast: boolean): Paragraph[] {
  const lines = song.content.split("\n");
  const paragraphs: Paragraph[] = lines.map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line || " ",
            font: "Courier New",
            size: 20, // 10pt
          }),
        ],
        spacing: { after: 0, line: 240 }, // single spacing
      })
  );

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
