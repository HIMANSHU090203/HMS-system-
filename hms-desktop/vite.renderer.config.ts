import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Dynamic import for ESM-only package
  const react = await import("@vitejs/plugin-react");
  
  return {
    // Packaged Electron uses loadFile(); default base "/" makes /assets/... resolve to
    // file:///C:/assets/... and breaks with "Not allowed to load local resource".
    base: "./",
    plugins: [react.default()],
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      rollupOptions: {
        input: {
          main_window: "src/renderer.tsx",
        },
      },
    },
  };
});
