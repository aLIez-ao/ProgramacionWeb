import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src", // Carpeta raíz
  base: "./", // Para que los paths de build funcionen correctamente
  server: {
    port: 3000, // Cambiar puerto por defecto si quieres
    open: true, // Abre el navegador automáticamente
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Alias para importar JS/CSS más fácil
    },
  },
});
