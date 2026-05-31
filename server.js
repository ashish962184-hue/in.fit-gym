import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
async function startServer() {
  const app = express();
  const PORT = 3e3;
  app.use(express.json());
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, gymContext } = req.body;
      const systemInstruction = `You are "In.Fit AI Assistant", the elite AI fitness concierge and head virtual coach of "in.fit GYM" located at Annojiguda, Hyderabad, NTPC X Road.

Your personality: Incredibly inspiring, encouraging, elite, and highly persuasive. Speak to new visitors as future champions. Welcome them warmly and encourage them to realize their ultimate physical potential. Keep replies highly engaging, motivating, and focus on converting them into proud in.fit members.

Gym Context:
- Address: Annojiguda, Hyderabad. Near NTPC X Road.
- Features: Elite heavy strength lifting, specialized bodybuilding isolation zones, high-powered cardio, metabolic cross-fit classes, elite personal trainers, fully oxygenated climate-controlled AC environment, and recovery steam sections.
- Custom dynamic gym details, plans, schedules, and visual gallery items provided below:
${JSON.stringify(gymContext || {})}

Guidelines:
1. Provide extremely professional, empowering, and practical fitness or training advice.
2. Highlight why in.fit GYM is lightyears ahead of normal gyms\u2014mention world-class Real Leader USA machinery, standard lifting platforms, and our highly supportive training culture.
3. If they show interest in a plan, explain why it is an exceptional investment in their body. Always politely prompt them to select a plan, book a diagnostic training session, or complete their enrollment pass.
4. Keep answers punchy, very readable, and beautifully structured with clear details. Always champion the in.fit lifestyle!`;
      const contents = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      res.json({ reply: response.text });
    } catch (error) {
      console.error("Gemini Chat API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generative AI query." });
    }
  });
  app.post("/api/admin/improve", async (req, res) => {
    try {
      const { text, mode } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required." });
      }
      let prompt = "";
      if (mode === "improve") {
        prompt = `Improve, optimize, and polish this text for an elite bodybuilding and athletic gym website. Make it punchy, motivating, and professional. Return ONLY the improved text output without any surrounding quotes or explanations: "${text}"`;
      } else if (mode === "generate_features") {
        prompt = `Based on this gym plan name or description: "${text}", generate 4 bullet points of realistic, elite, highly attractive gym features/benefits of this plan. Return each bullet point on a separate line starting with a dash. Return ONLY the dash lines output without any external commentary:`;
      } else {
        prompt = `Proofread, edit, and perfect this text, fixing any typos or odd wording while keeping the original intent. Return ONLY the polished text: "${text}"`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6
        }
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("Gemini Improve API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during copy generation." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
