const fs = require("fs")
const path = require("path")

// cooldown storage
const cooldowns = {}

// analytics storage
const analytics = {
    totalCommands: 0,
    commandUsage: {},
    userUsage: {},
    startTime: Date.now()
}

function handleCommand(commandName, userName, targetName) {

    const dbPath = path.join(__dirname, "database", "users.json")
    const logPath = path.join(__dirname, "logs", "commands.log")

    const commandsPath = path.join(__dirname, "commands")
    const pluginsPath = path.join(__dirname, "plugins")

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

    // read command files
    const commandFiles = fs.readdirSync(commandsPath)

    // read plugin files (if folder exists)
    const pluginFiles = fs.existsSync(pluginsPath)
        ? fs.readdirSync(pluginsPath)
        : []

    // merge commands + plugins
    const files = [
        ...commandFiles.map(f => `commands/${f}`),
        ...pluginFiles.map(f => `plugins/${f}`)
    ]

    for (const file of files) {

        const command = require(`./${file}`)

        if (command.name === commandName) {

            // update analytics
            analytics.totalCommands++

            analytics.commandUsage[commandName] =
                (analytics.commandUsage[commandName] || 0) + 1

            analytics.userUsage[userName] =
                (analytics.userUsage[userName] || 0) + 1

            // log command
            const log = `[${new Date().toLocaleString()}] ${userName} used .${commandName}\n`
            fs.appendFileSync(logPath, log)

            return command.execute(user, targetName, data, dbPath, analytics)
        }
    }

    return "❌ Command not found"
}

module.exports = handleCommand