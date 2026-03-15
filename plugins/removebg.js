const axios = require("axios")
const FormData = require("form-data")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

async function streamToBuffer(stream) {
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    return buffer
}

async function uploadImage(buffer, filename = "image.jpg") {
    const form = new FormData()
    form.append("file", buffer, filename)

    const res = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
        headers: form.getHeaders(),
        timeout: 30000
    })

    const uploadedUrl = res?.data?.data?.url

    if (!uploadedUrl) {
        throw new Error("Upload failed")
    }

    // tmpfiles API gives a page URL, convert it to direct download URL
    return uploadedUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/")
}

async function resolveImageResponse(raw, contentType) {
    const type = (contentType || "").toLowerCase()

    if (type.startsWith("image/")) {
        return Buffer.from(raw)
    }

    const text = Buffer.from(raw).toString("utf8")

    try {
        const json = JSON.parse(text)

        const url =
            json?.result?.url ||
            json?.result ||
            json?.url ||
            json?.data?.url ||
            json?.output

        if (!url || typeof url !== "string") {
            throw new Error("No image URL in server response")
        }

        const img = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 30000
        })

        return Buffer.from(img.data)
    } catch (err) {
        throw new Error("Invalid removebg response")
    }
}

async function removeBackground(buffer) {
    const imageUrl = await uploadImage(buffer)

    const freeServers = [
        `https://widipe.com/removebg?url=${encodeURIComponent(imageUrl)}`,
        `https://api.maher-zubair.tech/ai/removebg?url=${encodeURIComponent(imageUrl)}`,
        `https://api.ryzendesu.vip/api/ai/removebg?url=${encodeURIComponent(imageUrl)}`
    ]

    for (const url of freeServers) {
        try {
            const res = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 45000,
                validateStatus: () => true
            })

            if (res.status >= 400) {
                throw new Error(`HTTP ${res.status}`)
            }

            const output = await resolveImageResponse(
                res.data,
                res.headers["content-type"]
            )

            if (output?.length) {
                return output
            }
        } catch (err) {
            console.log(`removebg server failed (${url}):`, err.message)
        }
    }

    throw new Error("All removebg servers failed")
}

module.exports = {
    name: "removebg",

    async execute(sock, msg) {
        try {
            const chatId = msg.key.remoteJid
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            const image = quoted?.imageMessage

            if (!image) {
                return "🖼 Reply to an image with *.removebg*"
            }

            await sock.sendMessage(chatId, {
                text: "🧼 Removing background... please wait"
            }, { quoted: msg })

            const stream = await downloadContentFromMessage(image, "image")
            const inputBuffer = await streamToBuffer(stream)

            const outputBuffer = await removeBackground(inputBuffer)

            await sock.sendMessage(chatId, {
                image: outputBuffer,
                mimetype: "image/png",
                caption: "✅ Background removed"
            }, { quoted: msg })

            return null
        } catch (err) {
            console.log("REMOVEBG ERROR:", err)
            return "⚠ Failed to remove background. Try again with a clear image."
        }
    }
}
