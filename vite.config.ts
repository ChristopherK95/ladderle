import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // Relative base so the build works on a GitHub Pages project subpath.
  base: "./",
  test: {
    environment: "node",
  },
});
