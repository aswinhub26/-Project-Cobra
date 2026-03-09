const yts = require("yt-search")
const ytdlp = require("yt-dlp-exec")
const fs = require("fs")
const path = require("path")

module.exports = {
name: "play",

async execute(user, query, data, dbPath, analytics, sock, msg) {

try {

if (!query) {
return "🎵 Example: .play believer"
}

const search = await yts(query)

if (!search.videos.length) {
return "❌ Song not found"
}

const video = search.videos[0]

const title = video.title
const duration = video.timestamp
const thumbnail = video.thumbnail

// preview message with thumbnail
await sock.sendMessage(msg.key.remoteJid, {
image: { url: thumbnail },
caption:
`🎵 Downloading: *${title}*\n\n` +
`⏱ Duration: ${duration}`
})

// file path
const filePath = path.join(__dirname, "../temp/song.mp3")

// download audio
await ytdlp(video.url, {
  extractAudio: true,
  audioFormat: "mp3",
  ffmpegLocation: "C:/Users/aswin/Desktop/ffmpeg-8.0.1-essentials_build/bin",
  output: filePath
})

// send audio
await sock.sendMessage(msg.key.remoteJid, {
audio: fs.readFileSync(filePath),
mimetype: "audio/mpeg",
fileName: title + ".mp3"
})

fs.unlinkSync(filePath)

return null

} catch (err) {

console.log("PLAY ERROR:", err)

return "⚠ Failed to download song"

}

}
}