import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
      "/gettoken": {
        target: "https://api.assemblyai.com/v2/realtime/token",
        changeOrigin: true,
        configure: (server, options) => {
          console.log("configured");
          server.on("proxyReq", (proxyreq, req, res, opt) => console.log);
        },

        rewrite: (path) => {
          const finalPath = path.replace(/^\/gettoken/, "");
          console.log(finalPath);
          return finalPath;
        },
      },
    },
  },
});
