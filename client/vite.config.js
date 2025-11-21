import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: ["f8aac8f3-b486-4d9e-8aa4-03298c78edd5.preview.emergentagent.com"]
  },
});
