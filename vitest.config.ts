import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/mock-data/**",
        "src/ui/shadcn/**",
        "src/server/db/schema.ts",
        "src/server/db/db-utils.ts",
        "src/server/db/index.ts",
        "src/server/db/mock-db.ts",
        "src/server/auth/index.ts",
        "src/server/auth/client.ts",
        "src/app/api/auth/**",
        "src/app/layout.tsx",
        "src/app/error.tsx",
        "src/app/global-error.tsx",
        "src/app/not-found.tsx",
        "src/app/page.tsx",
        "src/server/email/components/**",
        "src/server/email/templates/**",
        "src/server/email/email-tokens.ts",
        "src/server/email/email-assets.ts",
        "src/server/email/resend-client.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
