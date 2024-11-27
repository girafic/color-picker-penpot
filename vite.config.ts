import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        plugin: "src/plugin.ts",
        index: "./index.html",
      },
      output: {
        entryFileNames: "[name].js",
        format: "es",
      },
    },
  },
  preview: {
    port: 4400,
  },
  worker: {
    format: "es",
  },
});
