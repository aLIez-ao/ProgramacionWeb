import { defineConfig } from "vite";
import path from "path";

const siteName = "MiTubo";

export default defineConfig({
  root: "src", // Carpeta raíz
  base: "./", // Para que los paths de build funcionen correctamente
  envDir: path.resolve(__dirname),
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    "import.meta.env.SITE_NAME": JSON.stringify(siteName),
  },
});
