import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", globals: true, setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8", reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/app/layout.tsx", "src/app/sw.ts", "src/types/**", "src/components/ui/**"],
      thresholds: { lines: 80, branches: 75, functions: 75, statements: 80 },
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
