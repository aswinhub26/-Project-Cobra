const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

module.exports = {
name: "ai",

async execute(user, query, data, dbPath, analytics, sock, msg) {

try {

if (!query) {
return "🤖 Example:\n.ai explain cybersecurity"
}

await sock.sendMessage(msg.key.remoteJid, {
react: { text: "🧠", key: msg.key }
})

const completion = await groq.chat.completions.create({
messages: [
{ role: "user", content: query }
],
model: "llama-3.1-8b-instant"
})

const answer = completion.choices[0].message.content

await sock.sendMessage(msg.key.remoteJid, {
text: answer
}, { quoted: msg })

return null

} catch (err) {

console.log("AI ERROR:", err)

return "❌ AI service error"

}

}
}