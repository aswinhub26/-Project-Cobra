const axios = require("axios")

const languageMap = {
english: "en",
eng: "en",
en: "en",
tamil: "ta",
ta: "ta",
hindi: "hi",
hi: "hi"
}

function splitSentences(text) {
    return text
        .replace(/\s+/g, " ")
        .trim()
        .split(/(?<=[.!?।])\s+/u)
        .map(sentence => sentence.trim())
        .filter(Boolean)
}

function tokenize(text) {
    return (text.toLowerCase().match(/\p{L}+/gu) || []).filter(token => token.length > 2)
}

function createSimpleSummary(text) {
    const sentences = splitSentences(text)

    if (sentences.length <= 2) {
        return {
            summary: text.trim(),
            context: sentences[0] || text.trim()
        }
    }

    const freq = {}

    tokenize(text).forEach(token => {
        freq[token] = (freq[token] || 0) + 1
    })

    const scored = sentences.map((sentence, index) => {
        const words = tokenize(sentence)

        const score = words.reduce((total, word) => total + (freq[word] || 0), 0)

        return { sentence, index, score }
    })

    const keepCount = Math.max(1, Math.min(3, Math.ceil(sentences.length * 0.35)))

    const selected = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, keepCount)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence)

    return {
        summary: selected.join(" "),
        context: sentences[0]
    }
}

async function translateText(text, targetLang) {
    if (!text || targetLang === "en") return text

    const url = "https://translate.googleapis.com/translate_a/single"

    const res = await axios.get(url, {
        params: {
            client: "gtx",
            sl: "auto",
            tl: targetLang,
            dt: "t",
            q: text
        }
    })

    return res.data[0].map(part => part[0]).join("")
}

module.exports = {
    name: "simplify",

    async execute(sock, msg, args) {
        try {
            const chatId = msg.key.remoteJid

            if (!args) {
                return `✂️ *COBRA SIMPLIFY*

Usage:
.simplify <long text>
.simplify tamil <long text>
.simplify hindi <long text>
.simplify to english <long text>`
            }

            await sock.sendMessage(chatId, {
                react: { text: "✂️", key: msg.key }
            })

            let targetLang = "en"
            let inputText = args.trim()

            const toMatch = inputText.match(/^to\s+(english|eng|en|tamil|ta|hindi|hi)\s+(.+)/i)
            const directMatch = inputText.match(/^(english|eng|en|tamil|ta|hindi|hi)\s+(.+)/i)

            if (toMatch) {
                targetLang = languageMap[toMatch[1].toLowerCase()] || "en"
                inputText = toMatch[2].trim()
            } else if (directMatch) {
                targetLang = languageMap[directMatch[1].toLowerCase()] || "en"
                inputText = directMatch[2].trim()
            }

            if (inputText.length < 30) {
                return "❌ Please send a bigger message (at least 30 characters) to simplify."
            }

            const { summary, context } = createSimpleSummary(inputText)

            const [translatedSummary, translatedContext] = await Promise.all([
                translateText(summary, targetLang),
                translateText(context, targetLang)
            ])

            return `✂️ *COBRA SIMPLIFY*

🌐 *Language:* ${targetLang}

📌 *Short Context:*
${translatedContext}

📝 *Easy Summary:*
${translatedSummary}

⚡ Send a longer passage for better simplification.`
        } catch (err) {
            console.log("SIMPLIFY ERROR:", err)
            return "⚠ Unable to simplify now. Please try again."
        }
    }
}
