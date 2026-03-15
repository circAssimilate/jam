#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateScale, suggestScales, SCALE_TYPES, ScaleType } from "./scales";

const server = new McpServer({
  name: "songbook-scales",
  version: "1.0.0",
});

const scaleTypeEnum = Object.keys(SCALE_TYPES) as [ScaleType, ...ScaleType[]];

server.tool(
  "generate_scale",
  `Generate ASCII guitar tab diagrams for scale positions.
Returns formatted tab showing fret positions for any key, scale type, and tuning.
Supported scales: ${scaleTypeEnum.join(", ")}`,
  {
    key: z.string().describe('Root and quality, e.g. "A minor", "E major", "F# minor"'),
    scaleType: z.enum(scaleTypeEnum).describe("Scale type to generate"),
    tuning: z.enum(["standard", "open-e"]).default("standard").describe("Guitar tuning"),
    positions: z.array(z.number().int().min(1).max(5)).default([1])
      .describe("Box positions to generate (1–5)"),
  },
  async (args) => {
    const result = generateScale(args.key, args.scaleType, args.tuning, args.positions);
    const output = result
      .map((pos) => `${pos.label}\n${pos.tab}`)
      .join("\n\n");
    return { content: [{ type: "text", text: output }] };
  }
);

server.tool(
  "suggest_scales",
  "Given a song's key, suggest 3 appropriate scales to include in a songbook entry.",
  {
    key: z.string().describe('The song key, e.g. "A minor", "G major"'),
  },
  async (args) => {
    const suggestions = suggestScales(args.key);
    return {
      content: [{
        type: "text",
        text: `Suggested scales for ${args.key}:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
