import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max upload

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Speech Transcription / Audio Analysis Endpoint using Gemini SDK
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      console.log("API key exists:", !!apiKey);
      console.log("API key prefix:", apiKey.substring(0, 5));

      const modelEngine = req.body.engine || "gemini-2.5-flash";
      const file = req.file;
      const audioBase64 = req.body.audioBase64;
      const mimeType = req.body.mimeType || "audio/mp3";

      let base64Data = "";
      let finalMime = mimeType;

      if (file) {
        base64Data = file.buffer.toString("base64");
        finalMime = file.mimetype || "audio/mp3";
      } else if (audioBase64) {
        base64Data = audioBase64.replace(/^data:[^;]+;base64,/, "");
      } else {
        return res.status(400).json({ error: "No audio file or data provided for transcription." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const promptText = `Please act as a professional speech-to-text transcription engine (${modelEngine === 'whisper' ? 'OpenAI Whisper style accurate transcription' : 'Google Cloud / Gemini Speech model'}). Provide:
1. Exact verbatim transcript of the spoken words in the audio.
2. A structured summary with bullet points.
3. Detected language and tone.
Format the output as clean JSON with keys: "transcript", "summary", "language", "wordCount".`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: finalMime
                }
              },
              {
                text: promptText
              }
            ]
          }
        ]
      });

      const responseText = response.text || "";
      
      // Try to parse JSON from response or fallback to raw text
      let resultObj;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resultObj = JSON.parse(jsonMatch[0]);
        } else {
          resultObj = {
            transcript: responseText,
            summary: "Transcript generated successfully.",
            language: "English",
            wordCount: responseText.split(/\s+/).length
          };
        }
      } catch (e) {
        resultObj = {
          transcript: responseText,
          summary: "Transcript generated successfully.",
          language: "English",
          wordCount: responseText.split(/\s+/).length
        };
      }

      res.json({
        success: true,
        engine: modelEngine,
        ...resultObj
      });

    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OmniFile Server running on http://localhost:${PORT}`);
  });
}

startServer();
