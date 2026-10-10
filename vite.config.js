import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createDatabase } from "./server/db.mjs";

const MODEL = "gemini-3.5-flash";

function guideApi(apiKey) {
  const handle = (req, res, next) => {
    const url = req.url?.split("?")[0];
    if (url !== "/api/guide" || req.method !== "POST") {
      next();
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Gemini API key is not configured." }));
          return;
        }
        const incoming = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const prompt = String(incoming.prompt || "").slice(0, 24000);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: "You are TravelBuddy, a calm travel guide. Answer only from the retrieved city notes and the itinerary in the user message. Write plain, specific sentences a traveller can follow. Name places, distances, and clock times when they are in the material. If a fact is missing, say the city guide does not have it. Do not mention SQL, embeddings, scores, or that you are a language model. If the message says the plan changed, describe the new route.",
                  },
                ],
              },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 800,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
          }
        );
        const payload = await response.json();
        const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
        if (!response.ok || !text) {
          res.statusCode = response.ok ? 502 : response.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: payload.error?.message || "Gemini returned an empty reply." }));
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ text }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message || "Guide request failed." }));
      }
    });
  };

  return {
    name: "travelbuddy-guide",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

function databaseApi(connectionString) {
  const db = createDatabase(connectionString);
  const handle = async (req, res, next) => {
    const url = req.url?.split("?")[0];
    if (url !== "/api/db" || req.method !== "POST") {
      next();
      return;
    }
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const incoming = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      await db.save(incoming.kind, incoming.record || {});
      res.statusCode = 204;
      res.end();
    } catch (error) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message || "Database unavailable." }));
    }
  };
  return {
    name: "layover-db",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      guideApi(env.GEMINI_API_KEY),
      databaseApi(env.DATABASE_URL || "postgres://layover:layover@127.0.0.1:5433/layover"),
    ],
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});
