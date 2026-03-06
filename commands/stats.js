module.exports = {
    name: "stats",

    execute(user, targetName, data, dbPath, analytics) {

        const uptime = Math.floor((Date.now() - analytics.startTime) / 1000)

        const mostUsedCommand =
            Object.keys(analytics.commandUsage)
                .sort((a, b) => analytics.commandUsage[b] - analytics.commandUsage[a])[0] || "None"

        const mostActiveUser =
            Object.keys(analytics.userUsage)
                .sort((a, b) => analytics.userUsage[b] - analytics.userUsage[a])[0] || "None"

        return `
📊 Project Cobra Analytics

⚡ Total Commands Used: ${analytics.totalCommands}
🔥 Most Used Command: ${mostUsedCommand}
👤 Most Active User: ${mostActiveUser}
⏱ Bot Uptime: ${uptime}s
`
    }
}