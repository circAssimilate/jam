const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONIC: Record<string, string> = {
  Db: "C#", Eb: "D#", Fb: "E", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B",
};

const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"];
const OPEN_E_TUNING = ["E", "B", "E", "G#", "B", "E"];

export const SCALE_TYPES = {
  "minor pentatonic":  [0, 3, 5, 7, 10],
  "major pentatonic":  [0, 2, 4, 7, 9],
  "blues":             [0, 3, 5, 6, 7, 10],
  "dorian":            [0, 2, 3, 5, 7, 9, 10],
  "mixolydian":        [0, 2, 4, 5, 7, 9, 10],
  "natural minor":     [0, 2, 3, 5, 7, 8, 10],
  "major":             [0, 2, 4, 5, 7, 9, 11],
} as const;

export type ScaleType = keyof typeof SCALE_TYPES;

export interface ScalePosition {
  label: string;
  tab: string;
}

const POSITION_START_DEGREES = [0, 1, 2, 3, 4];

function noteIndex(note: string): number {
  const normalized = ENHARMONIC[note] || note;
  const idx = NOTE_NAMES.indexOf(normalized);
  if (idx === -1) throw new Error(`Unknown note: ${note}`);
  return idx;
}

function getScaleNotes(root: string, intervals: readonly number[]): number[] {
  const rootIdx = noteIndex(root);
  return intervals.map((i) => (rootIdx + i) % 12);
}

function fretsOnString(
  openNote: string,
  scaleNotes: number[],
  minFret: number,
  maxFret: number
): number[] {
  const openIdx = noteIndex(openNote);
  const frets: number[] = [];
  for (let fret = minFret; fret <= maxFret; fret++) {
    const pitch = (openIdx + fret) % 12;
    if (scaleNotes.includes(pitch)) {
      frets.push(fret);
    }
  }
  return frets;
}

function getPositionFretRange(
  root: string,
  intervals: readonly number[],
  positionIndex: number,
  tuningNotes: string[]
): [number, number] {
  const scaleNotes = getScaleNotes(root, intervals);
  const lowStringOpen = noteIndex(tuningNotes[0]);

  // For 5-note scales use degree-based positioning; for 7-note scales use root-relative
  let startFret: number;
  if (intervals.length <= 6) {
    const degreeIdx = POSITION_START_DEGREES[positionIndex % 5];
    const targetNote = scaleNotes[degreeIdx % scaleNotes.length];
    startFret = (targetNote - lowStringOpen + 12) % 12;
  } else {
    // 7-note scales: position 1 starts at root, then every ~3 frets up
    const rootNote = scaleNotes[0];
    startFret = (rootNote - lowStringOpen + 12) % 12;
    startFret += positionIndex * 3;
  }

  if (positionIndex > 0) {
    const prevRange = getPositionFretRange(root, intervals, positionIndex - 1, tuningNotes);
    while (startFret <= prevRange[0]) {
      startFret += intervals.length <= 6 ? 12 : 3;
    }
  }

  // Wider window for 7-note scales
  const span = intervals.length <= 6 ? 3 : 4;
  return [startFret, startFret + span];
}

function formatTab(
  tuningNotes: string[],
  fretsByString: number[][],
  tuningLabels: string[]
): string {
  const lines: string[] = [];
  for (let s = tuningNotes.length - 1; s >= 0; s--) {
    const frets = fretsByString[s].sort((a, b) => a - b);
    const fretStr = frets.map((f) => f.toString().padStart(2, " ")).join("--");
    const label = tuningLabels[s].padStart(2, " ");
    lines.push(`${label}|--${fretStr}--|`);
  }
  return lines.join("\n");
}

export function generateScale(
  key: string,
  scaleType: ScaleType,
  tuning: "standard" | "open-e" = "standard",
  positions: number[] = [1]
): ScalePosition[] {
  const intervals = SCALE_TYPES[scaleType];
  if (!intervals) throw new Error(`Unknown scale type: ${scaleType}`);

  const tuningNotes = tuning === "standard" ? STANDARD_TUNING : OPEN_E_TUNING;
  const tuningLabels = tuning === "standard"
    ? ["E", "A", "D", "G", "B", "e"]
    : ["E", "B", "E", "G#", "B", "e"];

  const root = key.split(/\s/)[0];
  const scaleNotes = getScaleNotes(root, intervals);
  const result: ScalePosition[] = [];

  for (const posNum of positions) {
    const posIdx = posNum - 1;
    if (posIdx < 0 || posIdx > 4) continue;

    const fretRange = getPositionFretRange(root, intervals, posIdx, tuningNotes);
    const fretsByString: number[][] = [];

    for (let s = 0; s < tuningNotes.length; s++) {
      fretsByString.push(fretsOnString(tuningNotes[s], scaleNotes, fretRange[0], fretRange[1]));
    }

    const label = `Position ${posNum} (frets ${fretRange[0]}–${fretRange[1]})`;
    const tab = formatTab(tuningNotes, fretsByString, tuningLabels);
    result.push({ label, tab });
  }

  return result;
}

/**
 * Given a key like "A minor" or "E major", suggest 3 relevant scales.
 */
export function suggestScales(key: string): ScaleType[] {
  const isMinor = /minor|m$/i.test(key);
  if (isMinor) {
    return ["minor pentatonic", "blues", "dorian"];
  } else {
    return ["major pentatonic", "mixolydian", "major"];
  }
}
