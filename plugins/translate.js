const axios = require("axios")

const languageMap = {
    english: "en",
    tamil: "ta",
    hindi: "hi",
    french: "fr",
    spanish: "es",
    german: "de",
    chinese: "zh",
    japanese: "ja"
}

module.exports = {
    name: "translate",

    async execute(user, args) {

        if (!args) {
            return `🌍 *Cobra Translator*

Usage:
.translate hello ta
.translate hello to tamil

Examples:
.translate hello to french
.translate வணக்கம் to english
.translate bonjour to hindi`
        }

        let text = ""
        let targetLang = ""

        // Case 1: "hello to tamil"
        if (args.includes(" to ")) {

            const parts = args.split(" to ")

            text = parts[0].trim()

            const langName = parts[1].trim().toLowerCase()

            targetLang = languageMap[langName] || langName

        } 
        else {

            // Case 2: "hello ta"
            const parts = args.split(" ")

            targetLang = parts.pop()
            text = parts.join(" ")
        }

        if (!text || !targetLang) {
            return "❌ Usage: .translate hello to tamil"
        }

        try {

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`

            const res = await axios.get(url)

            const translated = res.data.responseData.translatedText

            return `🌍 *Cobra Translation*

📝 Text: ${text}

🌐 Target Language: ${targetLang}

✨ Translation:
${translated}`

        } catch (err) {

            console.log(err)

            return "⚠ Translation service error"
        }
    }
}