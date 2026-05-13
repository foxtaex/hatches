// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [
        "@uiw/react-md-editor",
        "@uiw/react-markdown-preview",
        "@uiw/react-codemirror",
        "@uiw/codemirror-extensions-basic-setup",
        "@fortawesome/react-fontawesome",
        "@fortawesome/fontawesome-svg-core",
        "@fortawesome/free-solid-svg-icons",
        "@fortawesome/free-regular-svg-icons",
        "@fortawesome/free-brands-svg-icons",
      ],
    },
    optimizeDeps: {
      exclude: ["better-sqlite3"],
    },
  },
});