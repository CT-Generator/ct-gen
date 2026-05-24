import OpenAI from "openai";
import fs from "node:fs";
const txt = fs.readFileSync(".env.local", "utf-8");
for (const line of txt.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = await client.chat.completions.create({
  model: process.env.OPENAI_MODEL || "gpt-5-mini",
  messages: [
    { role: "system", content: "Reply with the single word OK." },
    { role: "user", content: "ping" },
  ],
  reasoning_effort: "low",
});
console.log("model:", process.env.OPENAI_MODEL);
console.log("content:", r.choices[0]?.message?.content);
const m = await client.moderations.create({
  model: process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest",
  input: "test",
});
console.log("moderation flagged:", m.results[0]?.flagged);
