// frontend/vite.config.js

import {
  defineConfig,
  loadEnv
} from "vite";

import react from "@vitejs/plugin-react";

import {
  resolve
} from "path";

import {
  fileURLToPath
} from "url";

// =========================================================
// 🔹 ESM-COMPATIBLE __dirname FIX
// =========================================================
// Vite config files run as ES Modules (ESM).
// In ESM, __dirname and __filename do NOT exist by default.
// This is the correct cross-platform replacement.
// Without this, all resolve(__dirname, ...) calls will CRASH
// Vite on startup — causing "localhost:3000 can't be found".
// =========================================================

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = resolve(
  __filename,
  ".."
);

// =========================================================
// 🔹 EXPORT CONFIG
// =========================================================

export default defineConfig(

  ({ command, mode }) => {

    // =====================================================
    // 🔹 LOAD ENV VARIABLES
    // =====================================================

    const env = loadEnv(
      mode,
      process.cwd(),
      ""
    );

    // =====================================================
    // 🔹 API TARGET
    // =====================================================

    const API_TARGET =
      env.VITE_API_BASE_URL ||
      "http://127.0.0.1:8000";

    // =====================================================
    // 🔹 FLAGS
    // =====================================================

    const isDev =
      command === "serve";

    const isProd =
      command === "build";

    // =====================================================
    // 🔹 RETURN CONFIG
    // =====================================================

    return {

      // ===================================================
      // 🔹 PLUGINS
      // ===================================================

      plugins: [

        react({

          fastRefresh: true,

          babel: {
            plugins: []
          }
        })
      ],

      // ===================================================
      // 🔹 PATH ALIASES
      // ===================================================

      resolve: {

        alias: {

          "@": resolve(
            __dirname,
            "src"
          ),

          "@components": resolve(
            __dirname,
            "src/components"
          ),

          "@pages": resolve(
            __dirname,
            "src/pages"
          ),

          "@hooks": resolve(
            __dirname,
            "src/hooks"
          ),

          "@api": resolve(
            __dirname,
            "src/api"
          ),

          "@styles": resolve(
            __dirname,
            "src/styles"
          ),

          "@layout": resolve(
            __dirname,
            "src/components/layout"
          ),

          "@dashboard": resolve(
            __dirname,
            "src/components/dashboard"
          ),

          "@evaluation": resolve(
            __dirname,
            "src/components/evaluation"
          ),

          "@batch": resolve(
            __dirname,
            "src/components/batch"
          ),

          "@shared": resolve(
            __dirname,
            "src/components/shared"
          )
        }
      },

      // ===================================================
      // 🔹 DEVELOPMENT SERVER
      // ===================================================

      server: {

        port: 3000,

        open: true,

        host: "0.0.0.0",

        strictPort: true,

        cors: true,

        hmr: {
          overlay: true
        },

        // =================================================
        // 🔹 PROXY CONFIGURATION
        // =================================================

        proxy: {

          "/evaluation": {

            target: API_TARGET,

            changeOrigin: true,

            secure: false,

            ws: true,

            configure: (proxy) => {

              proxy.on("proxyReq", (proxyReq, req) => {
                console.log(`\n[Proxy Request] ${req.method} ${req.url}`);
                console.log(`[Backend] ${API_TARGET}${req.url}\n`);
              });

              proxy.on("proxyRes", (proxyRes, req) => {
                console.log(`[Proxy Response] ${proxyRes.statusCode} ${req.method} ${req.url}`);
              });

              proxy.on("error", (err, req) => {
                console.error(`\n[Proxy Error] ${req.url}`);
                console.error(err.message);
                console.error(`Is FastAPI running at ${API_TARGET}?\n`);
              });
            }
          }
        }
      },

      // ===================================================
      // 🔹 PREVIEW SERVER
      // ===================================================

      preview: {

        port: 4173,

        open: true,

        host: "0.0.0.0",

        proxy: {

          "/evaluation": {

            target: API_TARGET,

            changeOrigin: true,

            secure: false
          }
        }
      },

      // ===================================================
      // 🔹 BUILD CONFIGURATION
      // ===================================================

      build: {

        outDir: "dist",

        emptyOutDir: true,

        sourcemap: false,

        chunkSizeWarningLimit: 700,

        rollupOptions: {

          output: {

            manualChunks: {
              "vendor-react":  ["react", "react-dom", "react-router-dom"],
              "vendor-api":    ["axios"],
              "vendor-charts": ["recharts"]
            },

            chunkFileNames:  "assets/[name]-[hash].js",
            entryFileNames:  "assets/[name]-[hash].js",
            assetFileNames:  "assets/[name]-[hash].[ext]"
          }
        }
      },

      // ===================================================
      // 🔹 CSS CONFIGURATION
      // ===================================================

      css: {
        devSourcemap: true
      },

      // ===================================================
      // 🔹 GLOBAL DEFINITIONS
      // ===================================================

      define: {

        __APP_VERSION__: JSON.stringify(
          process.env.npm_package_version || "1.0.0"
        ),

        __BUILD_MODE__: JSON.stringify(mode),

        __IS_DEV__: JSON.stringify(isDev),

        __IS_PROD__: JSON.stringify(isProd),

        __API_TARGET__: JSON.stringify(API_TARGET)
      },

      // ===================================================
      // 🔹 OPTIMIZATION
      // ===================================================

      optimizeDeps: {

        include: [
          "react",
          "react-dom",
          "react-router-dom",
          "axios",
          "recharts"
        ]
      }
    };
  }
);