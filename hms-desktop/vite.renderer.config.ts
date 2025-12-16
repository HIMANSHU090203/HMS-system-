import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Dynamic import for ESM-only package
  const react = await import("@vitejs/plugin-react");
  
  return {
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
