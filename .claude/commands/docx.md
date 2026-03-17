Export songbook entries from this conversation to a .docx file.

## How to gather entries

Look through the conversation for songbook entries. Each entry is a block of monospace text that starts with a line of `============` and contains `Title:` / `Artist:` / `Key:` fields.

Extract each entry as:
- **title**: from the `Title:` line
- **artist**: from the `Artist:` line
- **content**: the entire text block (from first `====` line through the end of the scale reference section)

## How to export

1. First, check if `songbook/docx-export/dist/index.js` exists. If not, run:
   ```
   cd songbook/docx-export && npm install && npm run build && cd ../..
   ```

2. Construct a JSON object with this shape:
   ```json
   {
     "songs": [
       { "title": "Song Title", "artist": "Artist Name", "content": "...full entry text..." }
     ]
   }
   ```
   The script automatically names each file `Artist Name - Song Title (Key).docx` in the `output/` directory — one file per song, even when multiple songs are provided. No `outputPath` is needed.

   If `$ARGUMENTS` is provided, pass it as `"outputPath"` to write a single combined file instead.

3. Pipe the JSON to the script via Bash. Use a heredoc for the JSON to handle special characters:
   ```bash
   node songbook/docx-export/dist/index.js <<'JSONEOF'
   { ... }
   JSONEOF
   ```

4. If `$ARGUMENTS` is provided, use it as the output filename (under `output/`).

## Fallback

If .docx generation fails, the script automatically falls back to creating individual `.md` files (one per song) in the same output directory. Report this to the user.

## After export

Tell the user where the file was created so they can open it.
