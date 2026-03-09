const settings = require("../settings")

module.exports = {
name: "alive",

async execute(user, args, data, dbPath, analytics, sock, msg) {

try {

const text =
`🐍 *${settings.botName} is Active!*

⚡ *Version:* ${settings.version}
🟢 *Status:* Online
🌍 *Mode:* ${settings.mode}

✨ *Features*
• Group Management
• Antilink Protection
• Fun Commands
• AI Commands

Type *.menu* to see all commands.`

await sock.sendMessage(msg.key.remoteJid, {
text: text,
contextInfo: {
forwardingScore: 999,
isForwarded: true
}
}, { quoted: msg })

return null

} catch (err) {

console.log("Alive command error:", err)

return "⚠ Bot is alive but an error occurred"

}

}
}