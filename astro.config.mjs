// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        "@uiw/react-md-editor",
        "@uiw/react-markdown-preview",
        "@uiw/react-codemirror",
        "@uiw/codemirror-extensions-basic-setup",
      ],
    },
    optimizeDeps: {
      exclude: ["better-sqlite3"],
    },
  },
});