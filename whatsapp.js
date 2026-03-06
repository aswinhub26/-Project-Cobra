const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const pino = require("pino")
const handleCommand = require("./commandHandler")

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["Project Cobra", "Chrome", "1.0"]
    })

    sock.ev.on("connection.update", (update) => {

        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log("\n📱 Scan this QR with WhatsApp\n")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("🐍 Project Cobra connected to WhatsApp!")
        }

        if (connection === "close") {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log("⚠ Connection closed. Reconnecting:", shouldReconnect)

            if (shouldReconnect) {
                startBot()
            }
        }

    })

    sock.ev.on("creds.update", saveCreds)
    sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0]

    if (!msg.message) return

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text

    if (!text) return

    console.log("Message received:", text)

    // ignore messages without prefix
    if (!text.startsWith(".")) return

    // split command + arguments
    const args = text.slice(1).trim().split(" ")
    const commandName = args[0]
    const targetName = args[1]

    try {

        const response = handleCommand(commandName, "Aswin", targetName)

        if (response) {
            await sock.sendMessage(msg.key.remoteJid, { text: String(response) })
        }

    } catch (err) {

        console.log("Command error:", err)

        await sock.sendMessage(msg.key.remoteJid, {
            text: "⚠ Command failed"
        })

    }

})
}

startBot()