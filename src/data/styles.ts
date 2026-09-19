import type { VisualStyle } from "../types/experience";

export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: "cyberpunk",
    name: "赛博朋克",
    englishName: "CYBERPUNK",
    preview: {
      from: "#0ea5e9",
      via: "#db2777",
      to: "#6d28d9",
      filter: "contrast(1.25) saturate(1.4)",
    },
  },
  {
    id: "y2k",
    name: "Y2K",
    englishName: "Y2K CHROME",
    preview: {
      from: "#f9a8d4",
      via: "#c4b5fd",
      to: "#67e8f9",
      filter: "saturate(1.3) brightness(1.08)",
    },
  },
  {
    id: "film",
    name: "复古胶片",
    englishName: "VINTAGE FILM",
    preview: {
      from: "#78350f",
      via: "#b45309",
      to: "#44403c",
      filter: "sepia(0.45) contrast(1.1)",
    },
  },
  {
    id: "graffiti",
    name: "涂鸦手绘",
    englishName: "GRAFFITI",
    preview: {
      from: "#22c55e",
      via: "#eab308",
      to: "#ec4899",
      filter: "saturate(1.6) contrast(1.15)",
    },
  },
  {
    id: "starry",
    name: "梦幻星空",
    englishName: "STARLIT",
    preview: {
      from: "#1e1b4b",
      via: "#6d28d9",
      to: "#db2777",
      filter: "contrast(1.12) saturate(1.2)",
    },
  },
  {
    id: "mono",
    name: "极简黑白",
    englishName: "MONO",
    preview: {
      from: "#09090b",
      via: "#52525b",
      to: "#fafafa",
      filter: "grayscale(1) contrast(1.25)",
    },
  },
];
