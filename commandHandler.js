const fs = require("fs")
const path = require("path")

console.log("\n🐍 Project Cobra Booting...\n")

// cooldown storage
const cooldowns = {}

// analytics storage
const analytics = {
    totalCommands: 0,
    commandUsage: {},
    userUsage: {},
    startTime: Date.now()
}

const commands = {}

const commandsPath = path.join(__dirname, "commands")
const pluginsPath = path.join(__dirname, "plugins")

const commandFiles = fs.readdirSync(commandsPath)
const pluginFiles = fs.existsSync(pluginsPath) ? fs.readdirSync(pluginsPath) : []

console.log("⚡ Loading Commands...\n")

for (const file of commandFiles) {

    const command = require(`./commands/${file}`)

    commands[command.name] = command

    console.log(`✔ ${command.name}`)
}

console.log("\n🔌 Loading Plugins...\n")

for (const file of pluginFiles) {

    const plugin = require(`./plugins/${file}`)

    commands[plugin.name] = plugin

    console.log(`✔ ${plugin.name}`)
}

console.log("\n🚀 Cobra Ready\n")

function handleCommand(commandName, userName, targetName) {

    const dbPath = path.join(__dirname, "database", "users.json")
    const logPath = path.join(__dirname, "logs", "commands.log")

    const data = JSON.parse(fs.readFileSync(dbPath))

    const user = data.users.find(u => u.name === userName)

    if (!user) return "❌ User not found"
    if (user.banned) return "🚫 You are banned"

    // cooldown system
    const cooldownTime = 3000
    const now = Date.now()

    if (cooldowns[userName] && now - cooldowns[userName] < cooldownTime) {

        const remaining = ((cooldownTime - (now - cooldowns[userName])) / 1000).toFixed(1)

        return `⏳ Please wait ${remaining}s before using another command`
    }

    cooldowns[userName] = now

    const command = commands[commandName]

    if (!command) return "❌ Command not found"

    try {

        analytics.totalCommands++

        analytics.commandUsage[commandName] =
            (analytics.commandUsage[commandName] || 0) + 1

        analytics.userUsage[userName] =
            (analytics.userUsage[userName] || 0) + 1

        const log = `[${new Date().toLocaleString()}] ${userName} used .${commandName}\n`
        fs.appendFileSync(logPath, log)

        return command.execute(user, targetName, data, dbPath, analytics)

    } catch (err) {

        console.error("Command Error:", err)

        return "⚠ Error executing command"
    }
}

module.exports = handleCommand