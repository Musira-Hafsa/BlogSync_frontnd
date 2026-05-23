import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Proxy /api calls to Express so you don't need full URLs in dev
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target:      "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  // Relative paths for deployment
  base: "/",
});
