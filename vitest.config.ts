import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Prisma's constructor validates that DATABASE_URL exists (it doesn't
    // need to be reachable — no test here actually queries the DB), so
    // modules that import "@/lib/prisma" don't throw on import. A dummy
    // value keeps real credentials out of the test environment.
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
