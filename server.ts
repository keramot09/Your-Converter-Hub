import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import util from "util";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const execFilePromise = util.promisify(execFile);

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB for transcription

// Disk storage for large media processing (up to 200MB)
const diskUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 200 * 1024 * 1024 }
});

function getAudioMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "aac": return "audio/aac";
    case "m4a": return "audio/mp4";
    case "ogg": return "audio/ogg";
    case "flac": return "audio/flac";
    case "opus": return "audio/opus";
    default: return "audio/mpeg";
  }
}

interface AudioConvertOptions {
  inputPath: string;
  outputFormat: string;
  bitrate?: string;
}

async function convertMediaToAudio({ inputPath, outputFormat, bitrate }: AudioConvertOptions): Promise<string> {
  const fmt = (outputFormat || "mp3").toLowerCase().replace(/^\./, "");
  const outputPath = path.join(os.tmpdir(), `omni_audio_${Date.now()}_${Math.random().toString(36).slice(2)}.${fmt}`);

  const br = bitrate && /^[0-9]+k?$/i.test(bitrate) ? (bitrate.endsWith("k") ? bitrate : `${bitrate}k`) : "320k";

  const args = ["-y", "-i", inputPath, "-vn"];

  switch (fmt) {
    case "mp3":
      args.push("-c:a", "libmp3lame", "-b:a", br);
      break;
    case "wav":
      args.push("-c:a", "pcm_s16le");
      break;
    case "aac":
    case "m4a":
      args.push("-c:a", "aac", "-b:a", br);
      break;
    case "ogg":
      args.push("-c:a", "libvorbis", "-b:a", br);
      break;
    case "flac":
      args.push("-c:a", "flac");
      break;
    case "opus":
      args.push("-c:a", "libopus", "-b:a", br);
      break;
    default:
      args.push("-c:a", "libmp3lame", "-b:a", "320k");
      break;
  }

  args.push(outputPath);

  await execFilePromise("ffmpeg", args);
  return outputPath;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Real Audio Extraction from Video (FFmpeg)
  app.post("/api/extract-audio", diskUpload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided for audio extraction." });
    }

    const inputPath = req.file.path;
    const outputFormat = (req.body.format || "mp3").toLowerCase().trim();
    const bitrate = (req.body.bitrate || "320k").trim();

    let outputPath: string | null = null;

    try {
      outputPath = await convertMediaToAudio({
        inputPath,
        outputFormat,
        bitrate
      });

      const originalBaseName = req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')) || req.file.originalname;
      const downloadFilename = `${originalBaseName}_extracted.${outputFormat}`;
      const mimeType = getAudioMimeType(outputFormat);

      res.setHeader("Content-Type", mimeType);
      res.download(outputPath, downloadFilename, (err) => {
        if (fs.existsSync(inputPath)) {
          fs.unlink(inputPath, () => {});
        }
        if (outputPath && fs.existsSync(outputPath)) {
          fs.unlink(outputPath, () => {});
        }
        if (err && !res.headersSent) {
          res.status(500).json({ error: "Failed to transmit extracted audio file." });
        }
      });
    } catch (error: any) {
      console.error("Audio extraction error:", error);
      if (fs.existsSync(inputPath)) {
        fs.unlink(inputPath, () => {});
      }
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlink(outputPath, () => {});
      }
      res.status(500).json({
        error: "Audio extraction failed. Please ensure the video contains a valid audio track.",
        details: error?.message || String(error)
      });
    }
  });

  // Real Audio Conversion (FFmpeg)
  app.post("/api/convert-audio", diskUpload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    const inputPath = req.file.path;
    const targetFormat = (req.body.format || "mp3").toLowerCase().trim();
    const bitrate = (req.body.bitrate || "320k").trim();

    let outputPath: string | null = null;

    try {
      outputPath = await convertMediaToAudio({
        inputPath,
        outputFormat: targetFormat,
        bitrate
      });

      const originalBaseName = req.file.originalname.substring(0, req.file.originalname.lastIndexOf('.')) || req.file.originalname;
      const downloadFilename = `${originalBaseName}.${targetFormat}`;
      const mimeType = getAudioMimeType(targetFormat);

      res.setHeader("Content-Type", mimeType);
      res.download(outputPath, downloadFilename, (err) => {
        if (fs.existsSync(inputPath)) {
          fs.unlink(inputPath, () => {});
        }
        if (outputPath && fs.existsSync(outputPath)) {
          fs.unlink(outputPath, () => {});
        }
        if (err && !res.headersSent) {
          res.status(500).json({ error: "Failed to transmit converted audio file." });
        }
      });
    } catch (error: any) {
      console.error("Audio conversion error:", error);
      if (fs.existsSync(inputPath)) {
        fs.unlink(inputPath, () => {});
      }
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlink(outputPath, () => {});
      }
      res.status(500).json({
        error: "Audio conversion failed.",
        details: error?.message || String(error)
      });
    }
  });

  // AI Speech Transcription / Audio Analysis Endpoint using Gemini SDK
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

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

      const promptText = `Please act as a professional multilingual speech-to-text transcription engine.
CRITICAL INSTRUCTION:
1. Detect the exact language/dialect spoken in the audio.
2. Transcribe the spoken words VERBATIM in their original native language and script (e.g., if the audio is in Hindi, output Hindi script; if Tamil, Tamil script; if English, English; if Spanish, Spanish; if Bengali, Bengali, etc.). DO NOT translate the speech into any other language.
3. Provide a structured summary with bullet points (written in the detected language or English for clarity).
4. Accurately identify and state the detected language and tone.
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
