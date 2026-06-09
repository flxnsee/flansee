import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // головний сайт (habitat) -> dist/index.html
        main: resolve(__dirname, "index.html"),
        // тренажер ООКП (окремий route) -> dist/ookp/index.html, віддається на /ookp/
        ookp: resolve(__dirname, "ookp/index.html"),
      },
    },
  },
});
