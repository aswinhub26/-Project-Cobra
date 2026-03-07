const fs = require("fs")
const path = require("path")
const https = require("https")

module.exports = {
    name: "cobra",

    async execute(user, args) {

        if (!args) return "❌ Usage: .cobra install plugin"

        const parts = args.split(" ")
        const action = parts[0]
        const plugin = parts[1]

        if (action !== "install")
            return "❌ Usage: .cobra install plugin"

        if (!plugin)
            return "❌ Please specify plugin name"

        const pluginsDir = path.join(__dirname, "..", "plugins")

        if (!fs.existsSync(pluginsDir))
            fs.mkdirSync(pluginsDir)

        const url = `https://raw.githubusercontent.com/aswinhub26/cobra-plugins/main/${plugin}.js`

        const filePath = path.join(pluginsDir, `${plugin}.js`)
        const file = fs.createWriteStream(filePath)

        https.get(url, res => {

            if (res.statusCode !== 200) {
                return
            }

            res.pipe(file)

            file.on("finish", () => {
                file.close()
                console.log(`📦 Plugin installed: ${plugin}`)
            })

        })

        return `📦 Installing plugin: ${plugin}`
    }
}