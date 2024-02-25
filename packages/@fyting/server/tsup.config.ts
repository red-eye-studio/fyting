import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: ["src/main.ts"],
  clean: true,
  format: ["esm"],
  onSuccess: "tsc --emitDeclarationOnly --declaration",
  ...options,
}));
