import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite"; // Ensure this matches your installed version

export default defineConfig({
  plugins: [
    nitro({
      preset: "vercel", // Explicitly setting the preset for Vercel
    }),
  ],
});
