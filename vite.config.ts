  import { defineConfig } from "vite";
  import path from "path";
  import vue from "@vitejs/plugin-vue";
  import {imagetools} from 'vite-imagetools'

  export default defineConfig({
      plugins: [
          vue(),
          imagetools()
      ],
      resolve: {
          alias: {
              "@": path.resolve(__dirname, "./src"),
          },
      },
  });
