import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync("certs/privatekey.pem"),
      cert: fs.readFileSync("certs/certificate.pem"),
    },
    proxy: {
      "/api": {
        target: "https://127.0.0.1:8000",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
