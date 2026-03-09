const ytdlp = require("yt-dlp-exec")
const fs = require("fs")
const path = require("path")

module.exports = {
name: "ig",

async execute(user, link, data, dbPath, analytics, sock, msg) {

try {

if (!link) {
return "📥 Example:\n.ig https://instagram.com/reel/xxxx"
}

await sock.sendMessage(msg.key.remoteJid, {
text: "📥 Downloading Instagram video..."
})

const filePath = path.join(__dirname, "../temp/ig.mp4")

await ytdlp(link, {
output: filePath
})

await sock.sendMessage(msg.key.remoteJid, {
video: fs.readFileSync(filePath),
caption: "📥 Instagram video downloaded"
}, { quoted: msg })

fs.unlinkSync(filePath)

return null

} catch (err) {

console.log("IG ERROR:", err)

return "⚠ Instagram download failed"

}

}
}