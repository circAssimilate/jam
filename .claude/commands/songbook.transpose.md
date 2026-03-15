Transpose a previously created songbook entry to a new key: $ARGUMENTS

## How to parse the input

`$ARGUMENTS` can take two forms:

1. **Transpose to a specific key:**
   `<filepath> to <key>`
   Examples:
   - `output/use-me.md to G minor`
   - `output/cissy-strut.md to Bb major`

2. **Transpose by direction/interval:**
   `<filepath> <direction> <amount> <unit>`
   where `<unit>` is matched as a complete multi-word token:
   - `step` or `steps` — whole tone (2 semitones)
   - `half step` or `half steps` — semitone (1 semitone); treat `half step` as a single two-word unit, not as `half` + `step`

   Examples:
   - `output/use-me.md up 1 step`
   - `output/use-me.md down 2 steps`
   - `output/use-me.md up 1 half step`
   - `output/use-me.md down 3 half steps`

If the arguments are ambiguous, use AskUserQuestion to clarify before proceeding.

## Transposition reference

Chromatic scale (12 semitones):
```
C → C#/Db → D → D#/Eb → E → F → F#/Gb → G → G#/Ab → A → A#/Bb → B → (C)
0      1    2      3    4   5     6      7      8     9     10    11
```

- **1 whole step up** = +2 semitones
- **1 whole step down** = −2 semitones
- **1 half step up** = +1 semitone
- **1 half step down** = −1 semitone

When transposing, prefer sharps when going up and flats when going down (e.g. C# when up, Db when down). Use the musically natural enharmonic spelling that fits the target key.

## Workflow

1. **Read the source file** at the path provided in `$ARGUMENTS`.

2. **Determine the current key** from the `Key:` field in the header block.

3. **Determine the target key:**
   - If a specific key was given, use it directly.
   - If a direction/interval was given, calculate the new root note by shifting the current root by the specified number of semitones. Preserve the quality (major/minor).

4. **Calculate the semitone shift** between the current key root and the target key root. This single shift value applies uniformly to every chord in the file.

5. **Transpose all chords** in the entry:
   - Identify every chord symbol in the chord lines (lines above lyric placeholders or vamp patterns).
   - Shift each root note by the calculated semitone offset.
   - Preserve chord quality exactly (e.g. `m`, `7`, `maj7`, `sus4`, `dim`, `aug`, `/bass-note`, etc.).
   - Transpose any slash-chord bass note by the same offset.
   - Leave lyric placeholder lines (e.g. `[Verse 1 - see official lyrics source]`) and section labels (e.g. `[Verse 1]`) unchanged.
   - For Open E tuning sections, the fret-number references (e.g. `E(0) A(5) B(7)`) are position-based and depend on the Open E tuning's fixed open strings. Rather than attempting to re-derive fret positions (which requires knowing the original voicing), **preserve the existing tokens as-is and append `[UNVERIFIED - please check]`** so the player can verify the correct positions for the new key.

6. **Update the header block:**
   - Change the `Key:` field to the new key.
   - If the original had a capo, recalculate whether a capo is still needed. If the transposition shifts the sounding key but the player prefers to keep the same open-chord shapes, note that the capo position would need to change; otherwise mark `Capo: None` if transposing to actual pitch. When uncertain, mark `[UNVERIFIED - please check]`.

7. **Regenerate the scale reference block** for the new key:
   - Call `suggest_scales` with the new key.
   - Call `generate_scale` for each of the 3 suggested scales.
   - Replace the existing `--- SCALE REFERENCE ---` section with the new diagrams.

8. **Save the transposed entry:**
   - Write the result to `output/<original-filename-base>-<target-key-slug>.md`
     (e.g. `output/use-me-g-minor.md`). The key slug should be lowercase kebab-case.
   - Present the full transposed entry in the conversation.

9. **Ask the user** if they want to export the transposed entry to a `.docx` file. If yes, use the `/docx` skill.

## Important rules

- **Never reproduce copyrighted lyrics.** All lyric lines must remain as placeholders.
- Transpose chords only — do not alter section labels, lyric placeholders, or structural formatting.
- Keep the same overall formatting as the original (monospace header block, section labels, indentation, chord spacing).
- If any chord cannot be confidently transposed, mark it `[UNVERIFIED - please check]`.
