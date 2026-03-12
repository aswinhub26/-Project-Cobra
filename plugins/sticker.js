const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

module.exports = {
name: "sticker",

async execute(user, args, data, dbPath, analytics, sock, msg) {

try {

const chatId = msg.key.remoteJid

// quoted message
const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

// detect image/video
const image = msg.message?.imageMessage || quoted?.imageMessage
const video = msg.message?.videoMessage || quoted?.videoMessage

if (!image && !video) {
return "🖼 Send or reply to an image/video with *.sticker*"
}

const type = image ? "image" : "video"
const media = image || video

const stream = await downloadContentFromMessage(media, type)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

await sock.sendMessage(chatId,{
sticker: buffer
},{quoted:msg})

return null

} catch(err){

console.log("STICKER ERROR:",err)

return "⚠ Failed to create sticker"

}

}
}