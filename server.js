const express = require("express")
const handleCommand = require("./commandHandler")
const os = require("os")
const fs = require("fs")
const path = require("path")
const app = express()

app.use(express.json())
app.get("/health", (req, res) => {

    const memory = process.memoryUsage().heapUsed / 1024 / 1024

    res.json({
        status: "Project Cobra Running 🐍",
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: `${memory.toFixed(2)} MB`,
        nodeVersion: process.version,
        platform: process.platform,
        cpuCores: os.cpus().length,
        timestamp: new Date()
    })

})
console.log("🐍 Project Cobra Booting...\n")

const commandsPath = path.join(__dirname, "commands")
const pluginsPath = path.join(__dirname, "plugins")

console.log("⚙ Loading Commands...")

const commandFiles = fs.readdirSync(commandsPath)

commandFiles.forEach(file => {
    console.log(`✔ ${file} loaded`)
})

console.log("\n🔌 Loading Plugins...")

if (fs.existsSync(pluginsPath)) {

    const pluginFiles = fs.readdirSync(pluginsPath)

    pluginFiles.forEach(file => {
        console.log(`✔ ${file} loaded`)
    })

} else {
    console.log("No plugins found")
}

console.log("\n🚀 Cobra Ready!\n")

app.post("/command", (req, res) => {

    const { user, command, target } = req.body

    if (!user || !command) {
        return res.json({ error: "User and command required" })
    }

    const result = handleCommand(command, user, target)

    res.json({
        response: result
    })

})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`🐍 Project Cobra API running on port ${PORT}`)
})