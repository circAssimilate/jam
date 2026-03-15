# Jam — Guitar Songbook Project

This project contains tools for generating formatted guitar songbook entries.

## Songbook entry format

Every songbook entry must follow this exact format:

### Header block (monospace)

```
============================================================
Title:   [Song Title]
Artist:  [Artist]
Lyrics:  https://www.google.com/search?q=%22Song%20Title%22+%22Artist%22+full+lyrics
Key:     [Sounding key, e.g. "A minor"]
Capo:    [Fret number or "None"]
Tuning:  [e.g. "Standard (EADGBe)" or "Open E (EBE G#Be)"]
Tempo:   [~NNN bpm]
============================================================
```

The `Lyrics:` URL is a Google search link for the song's full lyrics. Construct it by fully percent-encoding the title and artist (using `encodeURIComponent` or equivalent — e.g. spaces → `%20`, `'` → `%27`, `&` → `%26`, `(` → `%28`), wrapping each encoded term in `%22`, and joining the three parts with `+`. For example, for "Use Me" by Bill Withers the URL is:
`https://www.google.com/search?q=%22Use%20Me%22+%22Bill%20Withers%22+full+lyrics`

### Sections

Each section gets a label in brackets, then chord/lyric lines:

```
[Verse 1]
  G           D         Em
  [Verse 1 - see official lyrics source]
```

For vamp / instrumental sections:
```
[Intro Riff]
  Am  /  /  /  |  Am  /  /  /  |  G  /  /  /  |
```

For Open E / slide sections:
```
[Chorus - Open E Tuning]
  E(0)  A(5)  B(7)  E(12)
```

Rules:
- **Never include copyrighted lyrics** — always use placeholders like `[Verse 1 - see official lyrics source]`
- Chord lines use monospace alignment — position chords above where they fall
- Mark any unverified field with `[UNVERIFIED - please check]`

### Scale reference block

Include 3 scales per song. Use the `suggest_scales` tool to pick appropriate scales for the key, then `generate_scale` for each. Format:

```
--- SCALE REFERENCE ---
Key: A minor

Scale 1: A Minor Pentatonic
Position 1 (frets 5–8)
 e|-- 5-- 8--|
 B|-- 5-- 8--|
 G|-- 5-- 7--|
 D|-- 5-- 7--|
 A|-- 5-- 7--|
 E|-- 5-- 8--|

Scale 2: A Blues
Position 1 (frets 5–8)
 e|-- 5-- 8--|
 B|-- 5-- 8--|
 G|-- 5-- 7-- 8--|
 D|-- 5-- 7--|
 A|-- 5-- 6-- 7--|
 E|-- 5-- 8--|

Scale 3: A Dorian
...
```

## MCP tools available

### songbook-scales

- `generate_scale` — generates ASCII tab for any scale/key/tuning/position
  - Supported scale types: minor pentatonic, major pentatonic, blues, dorian, mixolydian, natural minor, major
  - Tunings: standard, open-e
  - Positions: 1–5
- `suggest_scales` — given a key, returns 3 recommended scales

## Project structure

- `.claude/commands/songbook.create.md` — the `/songbook.create` slash command
- `.claude/commands/songbook.transpose.md` — the `/songbook.transpose` slash command
- `.claude/commands/docx.md` — the `/docx` export command
- `songbook/scales-mcp/` — MCP server for scale tab generation
- `songbook/docx-export/` — CLI tool to export songbook entries to `.docx`
