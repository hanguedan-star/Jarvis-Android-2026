import express from "express";
import path from "path";
import fs from "fs";
import dns from "node:dns";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Prefer IPv4 to avoid container IPv6 hang
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini client helper
function getGeminiClient() {
  const currentKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey: currentKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const JARVIS_SYSTEM_INSTRUCTION = `Tu es J.A.R.V.I.S. (Just A Rather Very Intelligent System), l'assistant personnel d'intelligence artificielle hautement sophistiqué, courtois, élégant, dévoué et précis.
Tu réponds TOUJOURS EN FRANÇAIS.
Ton ton est poli, digne d'un majordome futuriste de haute technologie ("Monsieur", "À vos ordres", "Protocoles activés", "Analyse terminée").
Sois concis, intelligent et naturel, particulièrement adapté à la lecture vocale par synthèse vocale (évite les listes à puces interminables ou les symboles bizarres si une phrase fluide convient mieux, mais reste précis quand on demande des données techniques).
Tu aides l'utilisateur pour toutes ses requêtes : questions générales, calculs, météo, planification, créativité, résumés, codage ou discussions interactives.
Lorsque l'utilisateur te demande un diagnostic système ou un rapport, formule ta réponse comme un véritable système d'exploitation IA connecté.`;

// API route for JARVIS Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], commandMode = "general" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message requis." });
    }

    const currentKey = process.env.GEMINI_API_KEY || "";
    if (!currentKey) {
      return res.json({
        reply: "Monsieur, la clé API Gemini n'a pas été détectée. Veuillez configurer votre clé dans le panneau Secrets d'AI Studio pour activer mes réponses en direct.",
        status: "KEY_MISSING",
      });
    }

    const ai = getGeminiClient();

    // Format chat history for Gemini
    const recentHistory = (history || []).slice(-10).map((h: { role: string; text: string }) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    const contents = [
      ...recentHistory,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    let dynamicInstruction = JARVIS_SYSTEM_INSTRUCTION;
    if (commandMode === "concise_voice") {
      dynamicInstruction += "\nIMPORTANT: Réponds de manière très concise (1 à 2 phrases fluides maximum en français) pour être immédiatement lu à haute voix.";
    } else if (commandMode === "diagnostic") {
      dynamicInstruction += "\nIMPORTANT: Réponds sous forme de rapport d'état technique de JARVIS.";
    }

    // Call fast free model (gemini-3.5-flash-lite) for instant sub-2s responses
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: contents,
        config: {
          systemInstruction: dynamicInstruction,
        },
      });
    } catch (e: any) {
      console.warn("Primary call failed, attempting fallback to gemini-3.8-flash...", e?.message);
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: dynamicInstruction,
        },
      });
    }

    const reply = response.text || "À vos ordres. J'ai bien reçu votre transmission, Monsieur.";

    res.json({
      reply,
      timestamp: new Date().toISOString(),
      status: "OPTIMAL",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    const errorMessage = error?.message || "";
    let friendlyReply = "Monsieur, une perturbation dans les flux neuronaux a empêché le traitement de votre requête. Je relance les sous-systèmes.";

    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      friendlyReply = "Monsieur, les quotas d'allocation cognitive sont momentanément saturés (Erreur 429). Veuillez patienter quelques instants.";
    } else if (errorMessage.includes("403") || errorMessage.includes("API_KEY_INVALID")) {
      friendlyReply = "Monsieur, l'accès à la matrice neuronale a été refusé. Veuillez vérifier la validité de votre clé API dans les paramètres.";
    }

    res.status(500).json({
      error: errorMessage,
      reply: friendlyReply,
    });
  }
});

// System Telemetry Endpoint
app.get("/api/system/status", (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    online: true,
    version: "Mark VII - v3.8",
    quantumCore: "Actif (Fréquence 4.2 GHz)",
    latencyMs: Math.floor(Math.random() * 8) + 12,
    cpuLoad: (Math.random() * 15 + 18).toFixed(1) + "%",
    energyLevel: "99.4%",
    memoryHeapMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    securityProtocol: "ALPHA-SECURE",
    activeSubsystems: ["Reconnaissance Vocale", "Synthèse Audio FR", "Noyau Cognitif Gemini", "Matrice HUD"],
  });
});

// Developer File Management routes for Android and in-app code editor
const ALLOWED_DEV_EXTS = [".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".md"];
const PROJECT_ROOT = process.cwd();

function isSafeDevPath(filePath: string): boolean {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  return resolved.startsWith(PROJECT_ROOT) && !resolved.includes("node_modules") && !resolved.includes(".git");
}

function getProjectDevFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === "dist") continue;
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getProjectDevFiles(fullPath, fileList);
      } else {
        const ext = path.extname(file);
        if (ALLOWED_DEV_EXTS.includes(ext)) {
          fileList.push(path.relative(PROJECT_ROOT, fullPath));
        }
      }
    } catch {
      // skip permission or unreadable
    }
  }
  return fileList;
}

app.get("/api/dev/files", (_req, res) => {
  try {
    const files = getProjectDevFiles(PROJECT_ROOT);
    res.json({ files: files.sort() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dev/file", (req, res) => {
  try {
    const relPath = req.query.path as string;
    if (!relPath || !isSafeDevPath(relPath)) {
      return res.status(400).json({ error: "Chemin de fichier invalide ou non autorisé." });
    }
    const fullPath = path.resolve(PROJECT_ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Fichier introuvable." });
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    res.json({ path: relPath, content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/dev/file", (req, res) => {
  try {
    const { path: relPath, content } = req.body;
    if (!relPath || typeof content !== "string" || !isSafeDevPath(relPath)) {
      return res.status(400).json({ error: "Chemin ou contenu invalide." });
    }
    const fullPath = path.resolve(PROJECT_ROOT, relPath);
    fs.writeFileSync(fullPath, content, "utf-8");
    res.json({ success: true, message: `Fichier ${relPath} sauvegardé avec succès.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dev/export-bundle", (_req, res) => {
  try {
    const files = getProjectDevFiles(PROJECT_ROOT);
    const bundle: Record<string, string> = {};
    for (const f of files) {
      const fullPath = path.resolve(PROJECT_ROOT, f);
      bundle[f] = fs.readFileSync(fullPath, "utf-8");
    }
    res.json({
      exportedAt: new Date().toISOString(),
      project: "JARVIS-AI",
      fileCount: files.length,
      files: bundle,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS AI running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
