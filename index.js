import express from "express";
import fs from "fs";
import fetch from "node-fetch";
import OpenAI from "openai";
import player from "play-sound";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // tvoj OpenAI ključ
});

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // tvoj ElevenLabs ključ
const ELEVEN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Primjer ženski glas

// Endpoint za “dolazni poziv”
app.post("/call", async (req, res) => {
  try {
    const inputText = req.body.input || "Pozdrav, ko ste vi?";

    // 1️⃣ GPT generira odgovor
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant answering phone calls." },
        { role: "user", content: inputText },
      ],
    });

    const aiText = gptResponse.choices[0].message.content;
    console.log("AI odgovor:", aiText);

    // 2️⃣ ElevenLabs generira glas
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: aiText,
        voice_settings: { stability: 0.7, similarity_boost: 0.75 }
      }),
    });

    const arrayBuffer = await ttsResponse.arrayBuffer();
    fs.writeFileSync("ai_response.wav", Buffer.from(arrayBuffer));

    // 3️⃣ Pusti audio lokalno (ako želiš na serveru neće raditi u cloud-u, samo za test)
    // player().play("ai_response.wav");

    // 4️⃣ Vrati audio kao response
    res.setHeader("Content-Type", "audio/wav");
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Greška u AI botu" });
  }
});

// Pokretanje servera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI bot server radi na portu ${PORT}`);
});
